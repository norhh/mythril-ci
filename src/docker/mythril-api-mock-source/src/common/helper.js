/* eslint-disable import/prefer-default-export */

/**
 * Fix _id and __v fields
 * @param {Object} obj
 * @returns {Object}
 */
export function fixMongoProps(obj) {
  if (!obj) {
    return obj;
  }
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
}
