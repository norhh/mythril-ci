import bluebird from 'bluebird';
global.Promise = bluebird;

require('babel-runtime/core-js/promise').default = bluebird; // eslint-disable-line import/no-commonjs
