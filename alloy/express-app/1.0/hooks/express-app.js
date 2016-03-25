exports.cliVersion = '>=3.X';
var _ = require('./underscore');

exports.init = function(logger, config, cli, appc) {

    var exec = require('child_process').exec;

    cli.addHook('build.pre.compile', function(build, finished) {
        var appDir = build.projectDir + '/app';
        logger.info("Running express-app plugin...");

        exec('cd "' + appDir + '" && browserify -g require-globify load.js --debug | exorcist lib/express-app.json  > lib/express-app.js', function(error, stdout, stderr) {
            logger.info(stderr);
            if (error) {
                logger.error(error);
                return process.exit(1);
            }
            var fs = require('fs');

            var oldFile = fs.readFileSync(appDir + '/lib/express-app.js');
            fs.writeFileSync(appDir + '/lib/express-app.js', 'var load = module.exports = ');
            fs.appendFileSync(appDir + '/lib/express-app.js', oldFile);

            var sourceMap = require(appDir + '/lib/express-app.json');

            var map = _.reduce(sourceMap.sources, function(result, source, index) {
                if (index >= 2) {
                    var splits = source.split('/');
                    if (splits.length > 1) {
                        if (splits[0] != 'node_modules') {
                            var withoutExt = source.split('.js')[0];
                            var withoutIndex = /^(.*)\/index$/g.exec(withoutExt);
                            var key = withoutIndex ? withoutIndex[1] : withoutExt;
                            result += '"'+key+'":load('+index+'),';
                        } else {
                            var name = splits[1];
                            if (!result[name]) {
                                var pkg = require(appDir + '/node_modules/'+name+'/package.json');
                                var main = pkg.main || './index.js';
                                if (pkg.browser) {
                                    main = pkg.browser[main];
                                }
                                main = main.substring(1);
                                if (source === 'node_modules/'+name+main) {
                                    result += '"'+name+'":load('+index+'),';
                                }
                            }
                        }
                    }
                }
                return result;
            }, '');
            logger.info(JSON.stringify(map));

            fs.appendFileSync(appDir + '/lib/express-app.js', '\n\nmodule.exports = {' + map + '};');

            finished();
        });
    });
};