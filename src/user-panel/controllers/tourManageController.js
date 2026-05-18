const TourManagement = require('../../admin-panel/models/TourManagement');

const tourManageController = {

    // ===============================
    // 1️⃣ TOUR LIST (USER SIDE)
    // ===============================
    async tourList(req, res) {
        try {
            const tours = await TourManagement.findAll({
                where: { status: 1 },
                attributes: [
                    'id',
                    "slug",
                    'image',
                    'tour_name',
                    'price',
                    'discount',
                    'days'
                ],
                order: [['created_at', 'DESC']]
            });
            const formattedTours = tours.map(tour => {
                const data = tour.toJSON();
                return {
                    ...data,
                    image: data.image ? `${process.env.APP_URL}/uploads/tour/${data.image}` : null
                    // image: `https://sit.resrv.in/storage/app/public/tour_and_travels/tour_visit/2026-01-28-6979d57d68e4a.webp`
                };
            });
            return res.status(200).json({
                success: true,
                message: 'Tour list fetched successfully',
                data: formattedTours
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Something went wrong'
            });
        }
    },

    // ===============================
    // 2️⃣ TOUR DETAILS (USER SIDE)
    // ===============================
    async tourDetails(req, res) {
        // try {
        const { id } = req.params;

        const tour = await TourManagement.findOne({
            where: {
                slug: id,
                status: 1
            }
        });
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found'
            });
        }

        tour.image = tour.image ? `${process.env.APP_URL}/uploads/tour/${tour.image}` : null;
        // tour.image = `https://sit.resrv.in/storage/app/public/tour_and_travels/tour_visit/2026-01-28-6979d57d68e4a.webp`;
        let images = [];
        if (tour.images) {
            const imageArray = JSON.parse(tour.images);

            images = imageArray.map(img =>
                `${process.env.APP_URL}/storage/app/public/tour_and_travels/tour_visit/${img}`
            );
        }
        tour.images = (images);
        return res.status(200).json({
            success: true,
            message: 'Tour details fetched successfully',
            data: tour
        });

        // } catch (error) {
        //     console.error(error);
        //     return res.status(500).json({
        //         success: false,
        //         message: 'Something went wrong'
        //     });
        // }
    }
};

module.exports = tourManageController;
