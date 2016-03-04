var jscs = require('gulp-jscs'),
    path = require('path');

/**
 * Register the linting task.
 *
 * @param  {Object} config
 * @param  {Gulp} gulp
 */
var register = function (config, gulp) {
  var source = [
    config.source,
    config.tasks,
    config.tests
  ].map(function (directory) {
    return path.join(directory, '**/*.js');
  });

  gulp.task('lint', function () {
    var stream = gulp.src(source)
      .pipe(jscs())
      .pipe(jscs.reporter());

    return stream;
  });
};

module.exports = register;
