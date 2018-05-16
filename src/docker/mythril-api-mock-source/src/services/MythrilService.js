/* eslint-disable no-magic-numbers */
/**
 * A service for command line wrapper
 */
import cp from 'child_process';
import decorate from 'decorate-it';
import Joi from 'joi';
import config from 'config';
import logger from '../common/logger';

// ------------------------------------
// Exports
// ------------------------------------

const MythrilService = {
  detectIssues,
};

decorate(MythrilService, 'MythrilService');

export default MythrilService;

detectIssues.params = ['options'];
detectIssues.schema = {
  options: Joi.object({
    bytecodes: Joi.array()
      .items(Joi.string())
      .required(),
  }).required(),
};

/**
 * Try to deserialize json
 * @param {String} content
 * @returns {Object}
 * @private
 */
function _deserialize(content) {
  let ret;
  try {
    ret = JSON.parse(content);
  } catch (e) {
    logger.error('cannot deserialize output', content);
    throw new Error('Invalid JSON output from myth');
  }
  if (ret.success) {
    return ret.issues;
  }
  throw new Error(`An error occurred: ${ret.error || 'Unknown error'}`);
}

/**
 * Detect issues
 * @param {Object} options the options to run
 * @returns {Promise} the result
 */
async function detectIssues(options) {
  return new Promise((resolve, reject) => {
    cp.exec(
      `${config.MYTH_COMMAND} -x -o json -c ${options.bytecodes.join(' ')}`,
      (err, stdout, stderr) => {
        if (err) {
          logger.error('detectIssues', err);
          reject(
            new Error(
              `An error occurred when running myth.
Output: ${stdout}
Error Output: ${stderr}`,
            ),
          );
          return;
        }
        resolve(stdout);
      },
    );
  }).then(_deserialize);
}
