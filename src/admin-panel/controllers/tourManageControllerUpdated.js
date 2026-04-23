const { TourManagement } = require('../../models');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const tourManageController = {
    // List all tours
    list: async (req, res) => {
        try {
            const tours = await TourManagement.findAll({
                where: { status: 1 }
            });
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
            // Check if body is empty - this usually means Content-Type issue
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Request body is empty. Please ensure Content-Type is not set to application/json when sending FormData'
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
            if (req.body.pricing_slabs && typeof req.body.pricing_slabs === 'string') {
                try {
                    pricing_slabs = JSON.parse(req.body.pricing_slabs);
                } catch (error) {
                    console.error('Error parsing pricing_slabs JSON:', error);
                }
            } else {
                pricing_slabs = parsePricingSlabsFromBody(req.body);
            }

            // Handle image upload if exists
            let imageUrl = '';
            let galleryImages = [];

            const uploadDir = path.join(__dirname, '../../../public/uploads/tour');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            // Main Image - multer puts file in req.files.image[0] with properties: originalname, mimetype, buffer
            const mainImage = files.find(file => file.fieldname === "image");
            // const mainImage = req.files?.image?.[0];
            if (mainImage) {
                const ext = path.extname(mainImage.originalname);
                imageUrl = `tour-${Date.now()}${ext}`;
                const newPath = path.join(uploadDir, imageUrl);
                // Write buffer to file
                fs.writeFileSync(newPath, mainImage.buffer);
            }

            // Gallery Images
            const galleryFiles = files.filter(file => file.fieldname === "images[]");
            // const galleryFiles = req.files?.['images[]'] || [];
            if (Array.isArray(galleryFiles)) {
                galleryFiles.forEach(file => {
                    const ext = path.extname(file.originalname);
                    const filename = `tour-${Date.now()}-${Math.random()}${ext}`;
                    const newPath = path.join(uploadDir, filename);
                    fs.writeFileSync(newPath, file.buffer);
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

            let pricing_slabs = [];
            if (req.body.pricing_slabs && typeof req.body.pricing_slabs === 'string') {
                try {
                    pricing_slabs = JSON.parse(req.body.pricing_slabs);
                } catch (error) {
                    console.error('Error parsing pricing_slabs JSON:', error);
                }
            } else {
                pricing_slabs = parsePricingSlabsFromBody(req.body);
            }


            // ================= MAIN IMAGE =================
            let imageUrls = [];
            let imageUrl = existingTour.image || '';
            const uploadDir = path.join(__dirname, '../../../public/uploads/tour');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const mainImage = req.files?.find(
                file => file.fieldname === "image"
            );;
            if (mainImage) {
                if (existingTour.image) {
                    const oldImagePath = path.join(uploadDir, existingTour.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                const ext = path.extname(mainImage.originalname);
                imageUrl = `tours-${Date.now()}${ext}`;
                const newPath = path.join(uploadDir, imageUrl);
                fs.writeFileSync(newPath, mainImage.buffer);
            }

            // Gallery Images
            const galleryFiles = req.files?.filter(
                file => file.fieldname === "images[]"
            );
            let existingImages = [];
            if (existingTour.images) {
                try {
                    existingImages = typeof existingTour.images === 'string'
                        ? JSON.parse(existingTour.images)
                        : existingTour.images;
                } catch (e) {
                    existingImages = [];
                }
            }

            // Keep old images
            imageUrls = [...existingImages];
            if (Array.isArray(galleryFiles)) {
                galleryFiles.forEach(file => {
                    const ext = path.extname(file.originalname);
                    const filename = `tour-${Date.now()}-${Math.random()}${ext}`;
                    const newPath = path.join(uploadDir, filename);
                    fs.writeFileSync(newPath, file.buffer);
                    imageUrls.push(filename);
                });
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
                images: imageUrls
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

    removeImage: async (req, res) => {
        try {
            const { id, index } = req.params;

            const existingTour = await TourManagement.findByPk(id);

            if (!existingTour) {
                return res.status(404).json({
                    success: false,
                    message: 'Tour not found'
                });
            }

            let images = existingTour.images ? JSON.parse(existingTour.images) : [];
            let index1 = Number(index);
            if (index1 < 0 || index1 >= images.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid index1'
                });
            }

            // ✅ remove without mutation
            const removedImage = images[index1];
            const updatedImages = images.filter((_, i) => i !== index1);

            // ✅ delete file
            const filePath = path.join(
                __dirname,
                '../../../public/uploads/tour',
                removedImage
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // ✅ update DB
            await TourManagement.update(
                { images: (updatedImages) },
                { where: { id } }
            );

            return res.status(200).json({
                success: true,
                message: 'Image removed successfully',
                images: updatedImages
            });

        } catch (error) {
            console.error('Error removing image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed',
                error: error.message
            });
        }
    },

    // Get tours with pagination
    paginatedList: async (req, res) => {
        try {
            const { page = 1, limit = 10, ...conditions } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await TourManagement.findAndCountAll({
                where: conditions,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                message: 'Tours fetched successfully',
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
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
        .replace(/&/g, 'and')
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
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
