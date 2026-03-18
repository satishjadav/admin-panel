const TourManagement = require('../models/TourManagement');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const tourManageController = {
    // List all tours
    list: async (req, res) => {
        try {
            const tours = await TourManagement.findAll(req.query);
            const formattedTours = tours.map(tour => {
                const data = tour.toJSON();
                return {
                    ...data,
                    image: data.image
                        ? `${process.env.APP_URL}/uploads/tour/${data.image}` : null
                };
            });
            res.json({
                success: true,
                message: 'Tours fetched successfully',
                data: formattedTours
            });
        } catch (error) {
            console.error('Error fetching tours:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tours',
                error: error.message
            });
        }
    },

    // Add new tour
    Save: async (req, res) => {
        try {
            const {
                tour_name,
                days,
                price,
                discount,
                description,
            } = req.body;
            const files = req.files;
            // Validate required fields
            if (!tour_name || !days || !price) {
                return res.status(400).json({
                    success: false,
                    message: 'Tour name, days, and price are required fields'
                });
            }

            const includes = req.body.includes
                ? JSON.parse(req.body.includes)
                : [];

            const excludes = req.body.excludes
                ? JSON.parse(req.body.excludes)
                : [];

            const itinerary = req.body.itinerary
                ? JSON.parse(req.body.itinerary)
                : [];

            const locations = req.body.locations
                ? JSON.parse(req.body.locations)
                : [];

            // Parse pricing slabs from the request
            let pricing_slabs = [];
            // Method 1: Check if pricing_slabs is sent as a JSON string
            if (req.body.pricing_slabs && typeof req.body.pricing_slabs === 'string') {
                try {
                    pricing_slabs = JSON.parse(req.body.pricing_slabs);
                } catch (error) {
                    console.error('Error parsing pricing_slabs JSON:', error);
                }
            }
            else {
                pricing_slabs = parsePricingSlabsFromBody(req.body);
            }

            // Handle image upload if exists
            let imageUrl = null;
            let galleryImages = [];
            const uploadDir = path.join(
                __dirname,
                '../../../public/uploads/tour'
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            if (files?.image) {
                const file = files.image;
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Only JPG, PNG, WEBP images allowed'
                    });
                }
                imageUrl = `tour-${Date.now()}${path.extname(file.name)}`;
                const newPath = path.join(
                    __dirname,
                    '../../../public/uploads/tour',
                    imageUrl
                );
                fs.renameSync(file.path, newPath);
            }
            if (files?.['images[]']) {
                const imageFiles = Array.isArray(files['images[]'])
                    ? files['images[]']
                    : [files['images[]']];
                imageFiles.forEach(file => {
                    const ext = path.extname(file.name);
                    const filename = `tour-${Date.now()}-${Math.random()}${ext}`;
                    fs.renameSync(file.path, path.join(uploadDir, filename));
                    galleryImages.push(filename);
                });
            }

            const tourData = {
                tour_name,
                slug: createSlug(tour_name),
                days: (days) || '',
                price: parseFloat(price) || 0,
                discount: discount ? parseFloat(discount) : 0,
                description: description || '',
                include: JSON.stringify(includes),
                exclude: JSON.stringify(excludes),
                itinerary,
                locations,
                pricing_slabs: pricing_slabs,
                image: imageUrl,
                images: galleryImages
            };
            const newTour = await TourManagement.create(tourData);

            res.status(201).json({
                success: true,
                message: 'Tour created successfully',
                data: newTour
            });
        } catch (error) {
            console.error('Error creating tour:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create tour',
                error: error.message
            });
        }
    },

    // Get tour by ID
    Edit: async (req, res) => {
        try {
            const { id } = req.params;
            const tour = await TourManagement.findByPk(id);

            if (!tour) {
                return res.status(404).json({
                    success: false,
                    message: 'Tour not found'
                });
            }

            const data = tour.toJSON();

            // ===== Decode JSON fields safely =====
            data.include = typeof data.include === 'string'
                ? JSON.parse(data.include || '[]')
                : data.include || [];

            data.exclude = typeof data.exclude === 'string'
                ? JSON.parse(data.exclude || '[]')
                : data.exclude || [];
            data.itinerary = typeof data.itinerary === 'string'
                ? JSON.parse(data.itinerary || '[]')
                : data.itinerary || [];
            data.locations = typeof data.locations === 'string'
                ? JSON.parse(data.locations || '[]')
                : data.locations || [];
            data.pricing_slabs = typeof data.pricing_slabs === 'string'
                ? JSON.parse(data.pricing_slabs || '[]')
                : data.pricing_slabs || [];
            // ===== Images (VERY IMPORTANT FIX) =====
            if (typeof data.images === 'string') {
                try {
                    data.images = JSON.parse(data.images);
                } catch {
                    data.images = [];
                }
            }

            if (!Array.isArray(data.images)) {
                data.images = [];
            }

            data.images = data.images.map(img =>
                `${process.env.APP_URL}/uploads/tour/${img}`
            );

            // ===== Main image =====
            data.image = data.image
                ? `${process.env.APP_URL}/uploads/tour/${data.image}`
                : null;

            res.json({
                success: true,
                message: 'Tour fetched successfully',
                data
            });

        } catch (error) {
            console.error('Error fetching tour:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tour',
                error: error.message
            });
        }
    },

    // Update tour
    Update: async (req, res) => {
        try {
            const { id } = req.params;
            const existingTour = await TourManagement.findByPk(id);
            if (!existingTour) {
                return res.status(404).json({
                    success: false,
                    message: 'Tour not found'
                });
            }
            const {
                tour_name,
                days,
                price,
                discount,
                description,
            } = req.body;
            const files = req.files;
            if (!tour_name || !days || !price) {
                return res.status(400).json({
                    success: false,
                    message: 'Tour name, days, and price are required fields'
                });
            }

            const includes = req.body.includes
                ? JSON.parse(req.body.includes)
                : tour.include ? JSON.parse(tour.include) : [];

            const excludes = req.body.excludes
                ? JSON.parse(req.body.excludes)
                : tour.exclude ? JSON.parse(tour.exclude) : [];

            const itinerary = req.body.itinerary
                ? JSON.parse(req.body.itinerary)
                : tour.itinerary || [];

            const locations = req.body.locations
                ? JSON.parse(req.body.locations)
                : tour.locations || [];

            let pricing_slabs = [];
            // Method 1: Check if pricing_slabs is sent as a JSON string
            if (req.body.pricing_slabs && typeof req.body.pricing_slabs === 'string') {
                try {
                    pricing_slabs = JSON.parse(req.body.pricing_slabs);
                } catch (error) {
                    console.error('Error parsing pricing_slabs JSON:', error);
                }
            }
            else {
                pricing_slabs = parsePricingSlabsFromBody(req.body);
            }
            let imageUrl = existingTour.image || '';
            const uploadDir = path.join(
                __dirname,
                '../../../public/uploads/tour'
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            if (files?.image) {
                const file = files.image;
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Only JPG, PNG, WEBP images allowed'
                    });
                }
                if (existingTour.image && existingTour.image !== '') {
                    const uploadDir = path.join(__dirname, '../../../public/uploads/tour');
                    const oldImagePath = path.join(uploadDir, existingTour.image);
                    if (fs.existsSync(oldImagePath)) {
                        try {
                            await fs.promises.unlink(oldImagePath);
                            console.log(`Image removed by user request: ${existingTour.image}`);
                        } catch (deleteError) {
                            console.error(`Error removing image: ${deleteError.message}`);
                        }
                    }
                }
                imageUrl = `tour-${Date.now()}${path.extname(file.name)}`;

                const newPath = path.join(
                    __dirname,
                    '../../../public/uploads/tour',
                    imageUrl
                );
                fs.renameSync(file.path, newPath);
            }

            let imageUrls = []; // final image names array

            if (files?.images) {
                // convert to array always
                const images = Array.isArray(files.images) ? files.images : [files.images];
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                const uploadDir = path.join(__dirname, '../../../public/uploads/tour');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                } // 🔴 DELETE OLD IMAGES (optional but best practice)
                if (existingTour.images && Array.isArray(existingTour.images)) {
                    for (const oldImg of existingTour.images) {
                        const oldPath = path.join(uploadDir, oldImg);
                        if (fs.existsSync(oldPath)) {
                            try {
                                await fs.promises.unlink(oldPath);
                                console.log(`Old image deleted: ${oldImg}`);
                            } catch (err) {
                                console.error(`Failed to delete ${oldImg}:`, err.message);
                            }
                        }
                    }
                }// 🟢 UPLOAD NEW IMAGES
                for (const file of images) {
                    if (!allowedTypes.includes(file.type)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Only JPG, PNG, WEBP images allowed'
                        });
                    }
                    const imageName = `tour-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
                    const newPath = path.join(uploadDir, imageName);
                    fs.renameSync(file.path, newPath);
                    imageUrls.push(imageName);
                }
            }
            const tourData = {
                tour_name,
                days: (days) || 0,
                price: parseFloat(price) || 0,
                discount: discount ? parseFloat(discount) : 0,
                description: description || '',
                include: JSON.stringify(includes),
                exclude: JSON.stringify(excludes),
                itinerary,
                locations,
                pricing_slabs: pricing_slabs,
                image: imageUrl,
                images:imageUrls
            };
            const updated = await TourManagement.update(tourData, {
                where: { id }
            });

            if (!updated) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update tour'
                });
            }

            res.json({
                success: true,
                message: 'Tour updated successfully',
                data: { id, ...tourData }
            });
        } catch (error) {
            console.error('Error updating tour:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update tour',
                error: error.message
            });
        }
    },

    // Delete tour
    Delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await TourManagement.destroy({
                where: { id }
            });
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Tour not found or already deleted'
                });
            }
            res.json({
                success: true,
                message: 'Tour deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting tour:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete tour',
                error: error.message
            });
        }
    },

    // Update tour status
    StatusUpdate: async (req, res) => {
        try {
            const { id } = req.params;
            const existingTour = await TourManagement.findByPk(id);
            if (!existingTour) {
                return res.status(404).json({
                    success: false,
                    message: 'Tour not found'
                });
            }

            // Toggle status
            const newStatus = existingTour.status === 1 ? 0 : 1;

            const updated = await TourManagement.update({ status: newStatus }, { where: { id } });

            if (!updated) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update tour status'
                });
            }

            res.json({
                success: true,
                message: `Tour status updated to ${newStatus === 1 ? 'active' : 'inactive'}`,
                data: {
                    id,
                    status: newStatus
                }
            });
        } catch (error) {
            console.error('Error updating tour status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update tour status',
                error: error.message
            });
        }
    },

    // Get tours with pagination (new endpoint)
    paginatedList: async (req, res) => {
        try {
            const { page = 1, limit = 10, ...conditions } = req.query;

            const result = await TourManagement.paginate(page, limit, conditions);

            res.json({
                success: true,
                message: 'Tours fetched successfully',
                ...result
            });
        } catch (error) {
            console.error('Error fetching paginated tours:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tours',
                error: error.message
            });
        }
    }
};

const createSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')        // & → and
        .replace(/[\s\W-]+/g, '-')  // spaces & special chars → -
        .replace(/^-+|-+$/g, '');   // trim - from start/end
};
function parsePricingSlabsFromBody(body) {
    const pricingSlabs = [];
    const slabKeys = Object.keys(body).filter(key => key.startsWith('pricing_slabs'));
    if (slabKeys.length === 0) return [];
    const slabsByIndex = {};
    slabKeys.forEach(key => {
        const match = key.match(/pricing_slabs\[(\d+)\]\[(\w+)\]/);
        if (match) {
            const index = match[1];
            const field = match[2];
            const value = body[key];
            if (!slabsByIndex[index]) {
                slabsByIndex[index] = {};
            }
            slabsByIndex[index][field] = value;
        }
    });
    Object.values(slabsByIndex).forEach(slab => {
        if (slab.min && slab.max && slab.price) {
            pricingSlabs.push({
                min: parseInt(slab.min) || 0,
                max: parseInt(slab.max) || 0,
                price: parseFloat(slab.price) || 0
            });
        }
    });

    return pricingSlabs;
}

module.exports = tourManageController;