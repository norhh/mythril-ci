/**
 * Represents the analysis
 */
import {Schema} from 'mongoose';
import {AnalysisResult, AnalysisType} from '../Const';

const Mixed = Schema.Types.Mixed;

export default new Schema({
  _id: {type: String, required: true},
  type: {type: String, required: true, enum: Object.values(AnalysisType)},
  result: {type: String, required: true, enum: Object.values(AnalysisResult)},
  input: {type: [String], required: true},
  output: Mixed,
  error: String,
});
