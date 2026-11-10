const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const {
  getDevotees,
  getDevoteeById,
  createDevotee,
  updateDevotee,
  bulkImportDevotees,
  exportDevoteesExcel,
} = require('../controllers/devoteeController');

router.use(protect);

router.get('/', getDevotees);
router.get('/export', exportDevoteesExcel);
router.get('/:memberId', getDevoteeById);
router.post('/', createDevotee);
router.put('/:memberId', updateDevotee);
router.post('/bulk-import', authorize('admin', 'superadmin'), upload.single('file'), bulkImportDevotees);

module.exports = router;
