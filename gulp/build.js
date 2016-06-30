var concat = require('gulp-concat'),
    fs = require('fs'),
    header = require('gulp-header'),
    iife = require('gulp-iife'),
    maps = require('gulp-sourcemaps'),
    order = require('gulp-order'),
    path = require('path'),
    rename = require('gulp-rename'),
    render = require('gulp-template'),
    size = require('gulp-size'),
    uglify = require('gulp-uglify');

/**
 * Header template.
 *
 * @type {String}
 */
var head = fs.readFileSync(path.join(__dirname, './head.tmpl'));

/**
 * Bang type comment filter.
 *
 * @param  {Object} node
 * @param  {String} comment
 * @return {Boolean}
 */
var comment = function (node, comment) {
  return /^\*\!/.test(comment.value);
};

/**
 * Register the build task.
 *
 * @param  {Object} config
 * @param  {Gulp} gulp
 */
var register = function (config, gulp) {
  var source = path.join(config.source, '*.js'),
      artifacts = {
        development: `${config.package.displayName}.js`,
        release: `${config.package.displayName}.min.js`
      };

  gulp.task('build', function () {
    var stream = gulp.src(source)
      .pipe(order([`!${config.entry}`]))
      .pipe(maps.init())
      .pipe(concat(artifacts.development))
      .pipe(iife({
        prependSemicolon: true,
        args: ['this'],
        params: ['global']
      }))
      .pipe(header(head, false))
      .pipe(render(config.package))
      .pipe(gulp.dest(config.bin))
      .pipe(uglify({ mangle: true, preserveComments: comment }))
      .pipe(rename(artifacts.release))
      .pipe(maps.write('./'))
      .pipe(size({ showFiles: true, gzip: true }))
      .pipe(gulp.dest(config.bin));

    return stream;
  });
};

module.exports = register;
