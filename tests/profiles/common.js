var chai = require('chai'),
    Assertion = chai.Assertion,
    util = chai.util;

/**
 * Container interface keys.
 *
 * @type {Array<String>}
 */
var CONTAINER_API_KEYS = ['bind', 'factory', 'instance'];

/**
 * Determines if a value is has a container like shape.
 *
 * @param  {*}  value
 * @return {Boolean}
 */
var isContainer = function (value) {
  var result = false;

  if (value != null) {
    var isContainerShape = CONTAINER_API_KEYS.reduce(function (result, key) {
      return value.hasOwnProperty(key) && typeof value[key] === 'function' && result;
    }, true);

    if (isContainerShape) {
      result = true;
    }
  }

  return result;
};

/**
 * Custom container chai assertion.
 */
Assertion.addProperty('container', function () {
  var actual = util.flag(this, 'object');

  this.assert(
    isContainer(actual),
    'expected #{this} to have a container shape.',
    'expected #{this} to not have a container shape.');
});
