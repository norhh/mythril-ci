/**
 * A service for analysis.
 */
import decorate from 'decorate-it';
import uuid from 'uuid';
import Joi from 'joi';
import HttpErrors from 'http-errors';
import logger from '../common/logger';
import {Analysis} from '../models';
import {AnalysisResult, AnalysisType} from '../Const';
import MessageService from './MessageService';
import MythrilService from './MythrilService';

// ------------------------------------
// Exports
// ------------------------------------

const AnalysisService = {
  submit,
  getStatus,
  getIssues,
  process,
};

decorate(AnalysisService, 'AnalysisService');

export default AnalysisService;

// starting with 0x is optional
// only hex letters
// 1 byte = 2 hex letters, so number of hex letters must be even
const CONTRACT_REGEXP = /^(0x)?([0-9a-fA-F]{2})+$/;

submit.params = ['data'];
submit.schema = {
  data: Joi.object()
    .keys({
      type: Joi.string()
        .allow(...Object.values(AnalysisType))
        .required(),
      contract: Joi.string().regex(CONTRACT_REGEXP),
      contracts: Joi.array().items(Joi.string().regex(CONTRACT_REGEXP)),
    })
    .required()
    .xor('contract', 'contracts'),
};

/**
 * Submit a new request
 * @param {Object} data
 * @returns {Object}
 */
async function submit(data) {
  const id = uuid.v4();
  const contracts = data.contracts ? data.contracts : [data.contract];
  const analysis = await Analysis.create({
    _id: id,
    type: data.type,
    result: AnalysisResult.QUEUED,
    input: contracts,
  });
  await MessageService.sendToQueue({id: analysis.id});
  return {
    result: analysis.result,
    uuid: analysis.id,
  };
}

getStatus.params = ['id'];
getStatus.schema = {
  id: Joi.string()
    .guid()
    .required(),
};

/**
 * Get a request status
 * @param {String} id the id
 * @returns {Object} the status information
 */
async function getStatus(id) {
  const analysis = await Analysis.findById(id);
  if (!analysis) {
    return {
      result: AnalysisResult.ERROR,
      message: `Analysis does not exist with id: ${id}`,
    };
  }
  if (analysis.result === AnalysisResult.ERROR) {
    return {
      result: AnalysisResult.ERROR,
      message: analysis.error,
    };
  }
  return {
    result: analysis.result,
    uuid: analysis.id,
  };
}

getIssues.params = ['id'];
getIssues.schema = {
  id: Joi.string()
    .guid()
    .required(),
};

/**
 * Get requests issues
 * @param {String} id the id
 * @returns {Array} the list of issues
 */
async function getIssues(id) {
  const analysis = await Analysis.findByIdOrError(id);
  if (analysis.result !== AnalysisResult.FINISHED) {
    throw new HttpErrors.BadRequest('Result is not Finished');
  }
  return analysis.output;
}


process.params = ['message'];
process.schema = {
  message: {
    id: Joi.string()
      .guid()
      .required(),
  },
};


/**
 * Process job
 * @param {Object} message
 */
async function process(message) {
  const analysis = await Analysis.findByIdOrError(message.id);
  try {
    await _processInner(analysis);
  } catch (e) {
    logger.error(e);
    analysis.result = AnalysisResult.ERROR;
    analysis.error = e.message;
  }
  await analysis.save();
}

/**
 * Process job
 * @param {Analysis} analysis
 * @private
 */
async function _processInner(analysis) {
  analysis.result = AnalysisResult.IN_PROGRESS;
  analysis.save();

  switch (analysis.type) {
    case AnalysisType.BYTECODE: {
      const result = await MythrilService.detectIssues({
        bytecodes: analysis.input,
      });
      analysis.result = AnalysisResult.FINISHED;
      analysis.output = result;
      return;
    }
    default:
      throw new Error(`not supported type: ${analysis.type}`);
  }
}
