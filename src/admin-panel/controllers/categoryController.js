const Category = require('../models/Category');

const categoryController = {
  // Get all categories
  getAll: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Get category by ID
  getById: async (req, res) => {
    try {
      const category = await Category.getById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Create category
  create: async (req, res) => {
    try {
      const categoryData = req.body;
      // Validation
      if (!categoryData.name || !categoryData.slug) {
        return res.status(400).json({
          success: false,
          message: 'Name and slug are required'
        });
      }

      const category = await Category.create(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Update category
  update: async (req, res) => {
    try {
      const categoryData = req.body;
      const categoryId = req.params.id;

      const existingCategory = await Category.getById(categoryId);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const updatedCategory = await Category.update(categoryId, categoryData);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Delete category
  delete: async (req, res) => {
    try {
      const categoryId = req.params.id;

      const existingCategory = await Category.getById(categoryId);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await Category.delete(categoryId);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Update category status
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;

      if (typeof status !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Status must be a number'
        });
      }

      const category = await Category.getById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await Category.updateStatus(req.params.id, status);

      res.json({
        success: true,
        message: 'Category status updated successfully'
      });
    } catch (error) {
      console.error('Update category status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = categoryController;