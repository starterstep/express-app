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

            var sources = require(appDir + '/lib/express-app.json').sources;
            var index = sources.indexOf("node_modules/express-app/index.js");

            logger.info('express-app found at index = ' + index);

            fs.appendFileSync(appDir + '/lib/express-app.js', '\n\nmodule.exports = load('+index+');');

            finished();
        });
    });
};