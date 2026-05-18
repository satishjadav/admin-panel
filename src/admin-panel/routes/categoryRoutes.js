const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', verifyToken, isAdmin, categoryController.getAll);
router.get('/:id', verifyToken, isAdmin, categoryController.getById);
router.post('/', verifyToken, isAdmin, categoryController.create);
router.put('/:id', verifyToken, isAdmin, categoryController.update);
router.delete('/:id', verifyToken, isAdmin, categoryController.delete);
router.patch('/:id/status', verifyToken, isAdmin, categoryController.updateStatus);

module.exports = router;