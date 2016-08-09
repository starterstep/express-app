var _ = require('underscore');
var s = require('underscore.string');

var $ = module.exports = {
    lib: {},
    plugins: {},
    controllers: {},
    services: {},
    managers: {}
};

$.load = function(_$) {
    if (_$) {
        _.extend($, _$);
    }
    console.log('');
    console.log('LOADING');

    var process = function(moduleName, list) {
        console.log('loading', moduleName);
        var module = $[moduleName];

        _.each(list, function(item) {
            if (item.name.indexOf('index') !== -1) {
                return;
            }
            if (item.name.indexOf('express') !== -1) {
                return;
            }
            var splits = item.name.split('/');
            if (splits.length > 1) {
                var ref = module;
                _.each(splits, function(split, index) {
                    split = s.camelize(split);
                    if (index === splits.length - 1) {
                        ref[split] = item.module;
                    } else {
                        ref = ref[split] || (ref[split] = {});
                    }
                });
            } else {
                module[s.camelize(item.name)] = item.module;
            }
        });
        console.log('loaded', moduleName);
    };

    process('lib', require('../../lib/**/*.js', {mode: 'list', options: {ignore:'../../lib/**/index.js'} }));
    require('../../lib/**/index.js', {mode: 'list'});

    process('plugins', require('../../plugins/**/*.js', {mode: 'list', options: {ignore:'../../plugins/**/index.js'} }));
    require('../../plugins/**/index.js', {mode: 'list'});

    process('controllers', require('../../controllers/**/*.js', {mode: 'list', options: {ignore:'../../controllers/**/index.js'} }));
    require('../../controllers/**/index.js', {mode: 'list'});

    process('services', require('../../services/**/*.js', {mode: 'list', options: {ignore:'../../services/**/index.js'} }));
    require('../../services/**/index.js', {mode: 'list'});

    process('managers', require('../../managers/**/*.js', {mode: 'list', options: {ignore:'../../managers/**/index.js'} }));
    require('../../managers/**/index.js', {mode: 'list'});

    return $;
};