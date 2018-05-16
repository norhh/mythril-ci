import AnalysisController from './controllers/AnalysisController';

export default {
  '/analysis/': {
    post: {
      public: true,
      method: AnalysisController.submit,
    },
  },
  '/analysis/:id': {
    get: {
      public: true,
      method: AnalysisController.getStatus,
    },
  },
  '/analysis/:id/issues': {
    get: {
      public: true,
      method: AnalysisController.getIssues,
    },
  },
};
