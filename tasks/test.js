import mocha from 'gulp-mocha';

/**
 * Pattern to match testing files.
 *
 * @type {string}
 */
const TEST_MATCH = './tests/**/*.tests.js';

/**
 * Mocha configuration options.
 *
 * @type {{report: string, require: string[]}}
 */
const MOCHA_CONFIG = {
  reporter: 'dot',
  require: ['babel-core/register', './tests/setup']
};

/**
 * Gulp stream error handler.
 *
 * @param {object} error
 */
const handleGulpError = (error) => {
  process.stdout.write(error.toString());
  process.exit(1);
};

/**
 * Creates and registers testing task.
 *
 * @param {gulp} gulp
 */
module.exports = (gulp) => {
  gulp.task('test', () => {
    return gulp.src(TEST_MATCH)
      .pipe(mocha(MOCHA_CONFIG))
      .once('error', (error) => handleGulpError(error));
  });
};
