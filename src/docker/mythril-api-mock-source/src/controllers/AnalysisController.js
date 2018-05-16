/**
 * A controller for analysis
 */
import AnalysisService from '../services/AnalysisService';

export default {
  submit,
  getStatus,
  getIssues,
};

/**
 * Submit new analysis
 * @param {Object} req
 * @param {Object} res
 */
async function submit(req, res) {
  res.json(await AnalysisService.submit(req.body));
}

/**
 * Get status
 * @param {Object} req
 * @param {Object} res
 */
async function getStatus(req, res) {
  res.json(await AnalysisService.getStatus(req.params.id));
}

/**
 * Get issues
 * @param {Object} req
 * @param {Object} res
 */
async function getIssues(req, res) {
  res.json(await AnalysisService.getIssues(req.params.id));
}
