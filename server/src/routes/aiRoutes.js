const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  chatWithAI,
  getDashboardAnalytics,
  getAutomatedInsights,
  downloadReport,
  executeAdminAction,
} = require('../controllers/aiController');

router.use(protect);

router.post('/chat', chatWithAI);
router.get('/analytics', getDashboardAnalytics);
router.get('/insights', getAutomatedInsights);
router.get('/reports/:type', downloadReport);
router.post('/execute-action', authorize('admin', 'superadmin'), executeAdminAction);

module.exports = router;
