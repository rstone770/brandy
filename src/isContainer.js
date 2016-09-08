import { CONTAINER_TYPE } from './createContainer';

/**
 * Determines if a value is a container type.
 *
 * @param {*} value
 * @returns {boolean}
 */
export default (value) => `${value}` === CONTAINER_TYPE;
