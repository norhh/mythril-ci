/**
 * The main entry for the worker process
 */

import './bootstrap';
import MessageService from './services/MessageService';
import AnalysisService from './services/AnalysisService';

/**
 * Start the worker
 */
async function start() {
  await MessageService.initChannel(true);
  MessageService.consume(AnalysisService.process);
}

if (!module.parent) {
  start();
}

export default start;
