const express = require('express');
const router = express.Router();
const {
  chatWithAI,
  getDashboardAnalytics,
  getAutomatedInsights,
  downloadReport,
  executeAdminAction,
} = require('../controllers/aiController');

router.post('/chat', chatWithAI);
router.get('/analytics', getDashboardAnalytics);
router.get('/insights', getAutomatedInsights);
router.get('/reports/:type', downloadReport);
router.post('/execute-action', executeAdminAction);

module.exports = router;
