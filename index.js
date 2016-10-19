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

    var process = function(moduleName, list) {
        console.log('loading', moduleName);
        var module = $[moduleName];

        var indexItems = [];

        var doItem = function(item) {
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
        };

        _.each(list, function(item) {
            //console.log('item.name=', item.name);
            if (item.name.indexOf('index') !== -1) {
                return indexItems.push(item);
            }
            doItem(item);
        });

        _.each(indexItems, function(item) {
            doItem(item);
        });
        console.log('loaded', moduleName);
    };

    process('lib', require('../../lib/**/*.js', {mode: 'list'}));

    process('plugins', require('../../plugins/**/*.js', {mode: 'list'}));

    process('controllers', require('../../controllers/**/*.js', {mode: 'list'}));

    process('services', require('../../services/**/*.js', {mode: 'list'}));

    process('managers', require('../../managers/**/*.js', {mode: 'list'}));

    process('orchestrators', require('../../orchestrators/**/*.js', {mode: 'list'}));

    return $;
};