/* eslint-disable no-magic-numbers */
/**
 * Configure all libraries
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bluebird from 'bluebird';
import decorate from 'decorate-it';
import config from 'config';

dotenv.config();

mongoose.Promise = bluebird;
global.Promise = bluebird;
require('babel-runtime/core-js/promise').default = bluebird; // eslint-disable-line import/no-commonjs

decorate.configure({
  debug: config.VERBOSE_LOGGING,
});
