const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const productController = {
  // Get all products
  getAll: async (req, res) => {
    // try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      category_id: req.query.category_id,
      status: req.query.status !== undefined ? parseInt(req.query.status) : undefined,
      search: req.query.search
    };

    const result = await Product.getAll(filters, page, limit);

    res.json({
      success: true,
      ...result
    });
    // } catch (error) {
    //   console.error('Get products error:', error);
    //   res.status(500).json({
    //     success: false,
    //     message: 'Server error'
    //   });
    // }
  },

  // Get product by ID
  getById: async (req, res) => {
    try {
      const product = await Product.getById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Create product
  create: async (req, res) => {
    try {
      const productData = req.body;
      const files = req.files;
      // Validation
      if (!productData.name || !productData.category_id || !productData.price) {
        return res.status(400).json({
          success: false,
          message: 'Name, category ID, and price are required'
        });
      }


      let imageName = null;

      if (files?.image) {
        const file = files.image;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return res.status(400).json({
            success: false,
            message: 'Only JPG, PNG, WEBP images allowed'
          });
        }

        // ✅ Generate unique name
        imageName = `product-${Date.now()}${path.extname(file.name)}`;

        const newPath = path.join(
          __dirname,
          '../../../public/uploads/products',
          imageName
        );
        fs.renameSync(file.path, newPath);
      }

      const product = await Product.create({
        ...productData,
        image: imageName
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Update product
  update: async (req, res) => {
    // try {
    const productData = req.body;
    const files = req.files;
    const productId = req.params.id;

    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let imageName = existingProduct.image||'';
    if (files?.image) {
      const file = files.image;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPG, PNG, WEBP images allowed'
        });
      }
      if (existingProduct.image && existingProduct.image !== '') {
            const uploadDir = path.join(__dirname, '../../../public/uploads/products');
            const oldImagePath = path.join(uploadDir, existingProduct.image);            
            if (fs.existsSync(oldImagePath)) {
                try {
                    await fs.promises.unlink(oldImagePath);
                    console.log(`Image removed by user request: ${existingProduct.image}`);
                } catch (deleteError) {
                    console.error(`Error removing image: ${deleteError.message}`);
                }
            }
        }
      imageName = `product-${Date.now()}${path.extname(file.name)}`;

      const newPath = path.join(
        __dirname,
        '../../../public/uploads/products',
        imageName
      );
      fs.renameSync(file.path, newPath);
    }
    const updatedProduct = await Product.update(productId, {
        ...productData,
        image: imageName
      });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
    // } catch (error) {
    //   console.error('Update product error:', error);
    //   res.status(500).json({
    //     success: false,
    //     message: 'Server error'
    //   });
    // }
  },

  // Delete product
  delete: async (req, res) => {
    try {
      const productId = req.params.id;

      const existingProduct = await Product.getById(productId);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Product.delete(productId);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Update product status
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;

      if (typeof status !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Status must be a number'
        });
      }

      const product = await Product.getById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Product.updateStatus(req.params.id, status);

      res.json({
        success: true,
        message: 'Product status updated successfully'
      });
    } catch (error) {
      console.error('Update product status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = productController;