import browserify from 'browserify';
import babelify from 'babelify';
import buffer from 'vinyl-buffer';
import deqequire from 'browserify-derequire';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';

/**
 * UMD module name.
 *
 * @type {string}
 */
const MODULE_NAME = 'brandy';

/**
 * Output bundle name.
 *
 * @type {string}
 */
const BUNDLE_NAME = 'brandy.js';

/**
 * Output minified bundle name.
 *
 * @type {string}
 */
const BUNDLE_MIN_NAME = 'brandy.min.js';

/**
 * Bundle output path.
 *
 * @type {string}
 */
const BUNDLE_PATH = './dist';

/**
 * Main entry point.
 *
 * @type {string}
 */
const MAIN_ENTRY_NAME = './src/index.js';

/**
 * Creates a bundle stream from an entry file.
 *
 * @param {string} entry
 * @param {string} name
 * @returns {Stream}
 */
const bundle = (entry, name) => {
  return browserify(entry, { standalone: name })
    .plugin(deqequire)
    .transform(babelify)
    .bundle();
};

/**
 * Creates and registers a bundle task.
 *
 * @param {gulp} gulp
 */
export default (gulp) => {
  const write = () => gulp.dest(BUNDLE_PATH);

  gulp.task('bundle', () => {
    return bundle(MAIN_ENTRY_NAME, MODULE_NAME)
      .pipe(source(BUNDLE_NAME))
      .pipe(buffer())
      .pipe(write())
      .pipe(uglify())
      .pipe(rename(BUNDLE_MIN_NAME))
      .pipe(write());
  });
};
