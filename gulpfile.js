var gulp = require('gulp'),
    path = require('path'),
    config = require('./gulpfile.config.js');

/**
 * Tasks to load.
 *
 * @type {Array<String>}
 */
var TASKS = ['build.js', 'lint.js'];

TASKS.forEach(function (task) {
  require(path.join(config.tasks, task))(config, gulp);
});
