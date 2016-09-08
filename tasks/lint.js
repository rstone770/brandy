import lint from 'gulp-eslint';

/**
 * Linting paths.
 *
 * @type {string[]}
 */
const SOURCES = [
  '**/*.js',
  '!node_modules/**',
  '!dist/**'
];

/**
 * Creates and registers linting task.
 *
 * @param {gulp} gulp
 */
export default (gulp) => {
  gulp.task('lint', () => {
    return gulp.src(SOURCES)
      .pipe(lint({}))
      .pipe(lint.format())
      .pipe(lint.failAfterError());
  });
};
