var _ = require('underscore');
var s = require('underscore.string');

var $ = module.exports = {};

var dirs = ['lib', 'plugins', 'controllers', 'services', 'managers', 'orchestrators'];
_.each(dirs, function(dir) {
    $[dir] = function(){return _.isFunction($[dir].index) && $[dir].index.apply(this,arguments)};
});

$.load = function(_$) {
    if (_$) {
        _.extend($, _$);
    }
    console.log('');
    console.log('LOADING');

    var process = function(moduleName, list, onlyIndex) {
        console.log('loading', moduleName, onlyIndex);
        var module = $[moduleName];

        _.each(list, function(item) {
            //console.log('item.name=', item.name);
            if (onlyIndex && item.name.indexOf('index') === -1) {
                return;
            }
            if (!onlyIndex && item.name.indexOf('index') !== -1) {
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
                        var localRef = ref;
                        ref = ref[split] || (ref[split] = function() {
                                return _.isFunction(localRef[split].index) && localRef[split].index.apply(this,arguments)
                            });
                    }
                });
            } else {
                module[s.camelize(item.name)] = item.module;
            }
        });
        console.log('loaded', moduleName);
    };

    process('lib', require('../../lib/**/*.js', {mode: 'list', options: {ignore:'../../lib/**/index.js'} }));
    process('lib', require('../../lib/**/*.js', {mode: 'list'}), true);

    process('plugins', require('../../plugins/**/*.js', {mode: 'list', options: {ignore:'../../plugins/**/index.js'} }));
    process('plugins', require('../../plugins/**/*.js', {mode: 'list'}), true);

    process('controllers', require('../../controllers/**/*.js', {mode: 'list', options: {ignore:'../../controllers/**/index.js'} }));
    process('controllers', require('../../controllers/**/*.js', {mode: 'list'}), true);

    process('services', require('../../services/**/*.js', {mode: 'list', options: {ignore:'../../services/**/index.js'} }));
    process('services', require('../../services/**/*.js', {mode: 'list'}), true);

    process('managers', require('../../managers/**/*.js', {mode: 'list', options: {ignore:'../../managers/**/index.js'} }));
    process('managers', require('../../managers/**/*.js', {mode: 'list'}), true);

    process('orchestrators', require('../../orchestrators/**/*.js', {mode: 'list', options: {ignore:'../../orchestrators/**/index.js'} }));
    process('orchestrators', require('../../orchestrators/**/*.js', {mode: 'list'}), true);

    return $;
};