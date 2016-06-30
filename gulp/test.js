var ConfigLoader = require('rcloader'),
    mocha = require('gulp-mocha'),
    path = require('path'),
    sequence = require('gulp-sequence');

/**
 * Generates a testing task with a custom mocha profile.
 *
 * @param {String} name
 * @param {Object} overrides
 */
var generate = function (name, overrides) {

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

    gulp.task(name, function () {
      var mochaConfig = Object.assign({}, mocharc.for(config.tests), overrides);

      return gulp.src(tests).pipe(mocha(mochaConfig));
    });
  };

  return register;
};

/**
 * Registers testing tasks tasks.
 *
 * @param {Object} config
 * @param {Gulp} gulp
 */
var register = function (config, gulp) {
  var profiles = config.package.testingProfiles || {},
      tasks = Object
        .keys(profiles)
        .map(function (profile) {
          return {
            name: ['test', profile].join(':'),
            profile: profiles[profile]
          };
        });

  gulp.task('test', function (done) {
    sequence.apply(null, tasks.map(function (task) {
      return task.name;
    }).concat(done));
  });

  tasks.map(function (task) {
    return generate(task.name, task.profile);
  }).forEach(function (register) {
    register(config, gulp);
  });
};

module.exports = register;
