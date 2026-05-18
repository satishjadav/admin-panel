const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', verifyToken, isAdmin, productController.getAll);
router.get('/:id', verifyToken, isAdmin, productController.getById);
router.post('/', verifyToken, isAdmin, productController.create);
router.put('/:id', verifyToken, isAdmin, productController.update);
router.delete('/:id', verifyToken, isAdmin, productController.delete);
router.patch('/:id/status', verifyToken, isAdmin, productController.updateStatus);

module.exports = router;