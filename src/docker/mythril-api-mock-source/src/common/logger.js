/**
 * Global logger
 */

import _ from 'lodash';
import bunyan from 'bunyan';
import config from 'config';

const logger = bunyan.createLogger({
  name: 'app',
  serializers: bunyan.stdSerializers,
  level: config.VERBOSE_LOGGING ? 'debug' : 'info',
});

if (process.env.NODE_ENV === 'test') {
  logger.constructor.prototype.error = _.noop;
//  Uncomment below line to debug unit tests, by default logs are hidden
//  logger.constructor.prototype.error = console.error.bind(console);
}

export default logger;
