var ConfigLoader = require('rcloader'),
    mocha = require('gulp-mocha'),
    path = require('path');

/**
 * Runtime config loader for mocha.
 *
 * @type {ConfigLoader}
 */
var mocharc = new ConfigLoader('.mocharc');

/**
 * Register the testing task.
 *
 * @param  {Object} config
 * @param  {Gulp} gulp
 */
var register = function (config, gulp) {
  var tests = path.join(config.tests, '**/*.test.js');

  gulp.task('test', function () {
    var stream = gulp.src(tests)
      .pipe(mocha(mocharc.for(config.test)));

    return stream;
  });
};

module.exports = register;
