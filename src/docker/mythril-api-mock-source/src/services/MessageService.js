/**
 * A service for rabbit mq messing.
 */
import decorate from 'decorate-it';
import amqp from 'amqplib';
import config from 'config';
import Joi from 'joi';
import logger from '../common/logger';

// ------------------------------------
// Exports
// ------------------------------------

const MessageService = {
  initChannel,
  sendToQueue,
  consume,
};

decorate(MessageService, 'MessageService');

export default MessageService;

/// ampq channel
let channel;

// ampq connection
let connection;

process.once('SIGINT', () => {
  try {
    connection.close();
  } catch (ignore) {
    // eslint-ignore-line
  }
  // eslint-disable-next-line no-process-exit
  process.exit();
});

/**
 * Connect to rabbit mq
 * @returns {Promise} the connection
 */
async function connect() {
  connection = await amqp.connect(config.RABBITMQ_URL);
  return connection;
}

initChannel.params = ['confirm'];
initChannel.schema = {
  confirm: Joi.boolean().required(),
};

/**
 * Init AMPQ channel
 * @param {Boolean} confirm the true if create a confirm channel (for consumer)
 */
async function initChannel(confirm) {
  await connect();
  channel = await (confirm
    ? connection.createConfirmChannel()
    : connection.createChannel());
  channel.assertQueue(config.QUEUE_NAME, {durable: true});
}

consume.params = ['fn'];
consume.schema = {
  fn: Joi.func().required(),
};

/**
 * Create a consumer for the queue
 * @param {Function} fn
 */
function consume(fn) {
  channel.prefetch(1);
  channel.consume(config.QUEUE_NAME, async (msg) => {
    if (!msg) {
      return;
    }
    logger.debug(`Consuming message in ${config.QUEUE_NAME}\n${msg.content}`);
    let project;
    try {
      project = JSON.parse(msg.content.toString());
    } catch (ignore) {
      logger.error('Invalid message. Ignoring');
      channel.ack(msg);
      return;
    }
    try {
      await fn(project);
    } catch (e) {
      logger.error(e, `Queue ${config.QUEUE_NAME}`);
    }
    channel.ack(msg);
  });
}


sendToQueue.params = ['message'];
sendToQueue.schema = {
  message: Joi.object().required(),
};

/**
 * Send a message to queue
 * @param {Object} message the message
 */
async function sendToQueue(message) {
  await channel.sendToQueue(
    config.QUEUE_NAME,
    new Buffer(JSON.stringify(message)),
  );
}
