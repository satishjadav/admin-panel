const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const tourManageController = require('../controllers/tourManageControllerUpdated');

// Configure multer for memory storage (we'll handle file saving in controller)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Public routes
router.get('/', tourManageController.list);
// Use any() to debug - accepts any fields, then controller can handle what's sent
router.post('/add', verifyToken, upload.any(), tourManageController.Save);
router.get('/edit/:id', verifyToken, tourManageController.Edit);
router.post('/update/:id', verifyToken,  upload.any(), tourManageController.Update);
router.delete('/delete/:id', verifyToken, tourManageController.Delete);
router.get('/status-update/:id', verifyToken, tourManageController.StatusUpdate);

// Protected routes

module.exports = router;
