const TourManagement = require('./TourManagement'); // Sequelize model

const tourManage = {
  // List all tours using findAll
  list: async (query = {}) => {
    try {
      const tours = await TourManagement.findAll({
        where: query,
        order: [['created_at', 'DESC']]
      });
      
      return tours.map(tour => tour.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Add new tour using create
  add: async (tourData) => {
    try {
      const tour = await TourManagement.create(tourData);
      return tour.toJSON();
    } catch (error) {
      throw error;
    }
  },

  // Get tour by ID using findOne
  getById: async (id) => {
    try {
      const tour = await TourManagement.findOne({
        where: { id }
      });
      
      return tour ? tour.toJSON() : null;
    } catch (error) {
      throw error;
    }
  },

  // Find tours by multiple conditions using findAll
  findByConditions: async (conditions) => {
    try {
      const tours = await TourManagement.findAll({
        where: conditions,
        order: [['created_at', 'DESC']]
      });
      
      return tours.map(tour => tour.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Update tour using update
  update: async (id, tourData) => {
    try {
      const [affectedRows] = await TourManagement.update(tourData, {
        where: { id }
      });
      
      return affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Delete tour using destroy
  delete: async (id) => {
    try {
      const affectedRows = await TourManagement.destroy({
        where: { id }
      });
      
      return affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Update status using update
  updateStatus: async (id, status) => {
    try {
      const [affectedRows] = await TourManagement.update(
        { status },
        { where: { id } }
      );
      
      return affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Find active tours
  findActive: async () => {
    try {
      const tours = await TourManagement.findAll({
        where: { status: 1 },
        order: [['created_at', 'DESC']]
      });
      
      return tours.map(tour => tour.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Find by price range
  findByPriceRange: async (minPrice, maxPrice) => {
    try {
      const tours = await TourManagement.findAll({
        where: {
          price: {
            [Op.between]: [minPrice, maxPrice]
          }
        },
        order: [['price', 'ASC']]
      });
      
      return tours.map(tour => tour.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Find by tour name (with search)
  findByTourName: async (tourName) => {
    try {
      const tours = await TourManagement.findAll({
        where: {
          tour_name: {
            [Op.like]: `%${tourName}%`
          }
        },
        order: [['tour_name', 'ASC']]
      });
      
      return tours.map(tour => tour.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Get count of tours
  getCount: async (conditions = {}) => {
    try {
      const count = await TourManagement.count({
        where: conditions
      });
      
      return count;
    } catch (error) {
      throw error;
    }
  },

  // Bulk create tours
  bulkCreate: async (toursData) => {
    try {
      const tours = await TourManagement.bulkCreate(toursData, {
        validate: true
      });
      
      return tours.map(tour => tour.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Find or create tour
  findOrCreate: async (tourData) => {
    try {
      const [tour, created] = await TourManagement.findOrCreate({
        where: { tour_name: tourData.tour_name },
        defaults: tourData
      });
      
      return { tour: tour.toJSON(), created };
    } catch (error) {
      throw error;
    }
  },

  // Increment views or other fields
  incrementField: async (id, field, value = 1) => {
    try {
      const tour = await TourManagement.findByPk(id);
      if (tour) {
        await tour.increment(field, { by: value });
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  },

  // Find with pagination
  findWithPagination: async (page = 1, limit = 10, conditions = {}) => {
    try {
      const offset = (page - 1) * limit;
      
      const { rows: tours, count } = await TourManagement.findAndCountAll({
        where: conditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      return {
        tours: tours.map(tour => tour.toJSON()),
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw error;
    }
  },

  // Find by multiple IDs
  findByIds: async (ids) => {
    try {
      const tours = await TourManagement.findAll({
        where: {
          id: {
            [Op.in]: ids
          }
        },
        order: [['created_at', 'DESC']]
      });
      
      return tours.map(tour => tour.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Find one with conditions
  findOneByConditions: async (conditions) => {
    try {
      const tour = await TourManagement.findOne({
        where: conditions
      });
      
      return tour ? tour.toJSON() : null;
    } catch (error) {
      throw error;
    }
  },

  // Update multiple records
  updateMultiple: async (conditions, updateData) => {
    try {
      const [affectedRows] = await TourManagement.update(updateData, {
        where: conditions
      });
      
      return affectedRows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = tourManage;