const { TourManagement, TourOrderManagement } = require('../../models');
const BusinessSetting = require('../../models/business_setting');
const { sendWhatsAppMessage } = require('../../utils/whatsappcopy');

// Helper function to format phone number for WhatsApp
const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return '91' + digits;
    }
    if (digits.length === 12) {
        return digits;
    }
    return phone;
};

const tourManageController = {

    // ===============================
    // 1️⃣ TOUR LIST (USER SIDE)
    // ===============================
    async tourList(req, res) {
        //try {
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
                };
            });
            return res.status(200).json({
                success: true,
                message: 'Tour list fetched successfully',
                data: formattedTours
            });

       // } catch (error) {
          //  console.error(error);
          //  return res.status(500).json({
            //    success: false,
              //  message: 'Something went wrong'
            //});
        //}
    },

    // ===============================
    // 2️⃣ TOUR DETAILS (USER SIDE)
    // ===============================
    async tourDetails(req, res) {
        try {
            const { id } = req.params;

            const tourData = await TourManagement.findOne({
                where: {
                    slug: id,
                    status: 1
                }
            });

            if (!tourData) {
                return res.status(404).json({
                    success: false,
                    message: 'Tour not found'
                });
            }

            // ✅ Convert to plain object
            const tour = tourData.toJSON();

            // ✅ Main image full path
            tour.image = tour.image
                ? `${process.env.APP_URL}/uploads/tour/${tour.image}`
                : null;

            // ✅ Get Tax
            const taxSetting = await BusinessSetting.findOne({
                where: { key: 'tax' }
            });

            const taxPercent = taxSetting ? Number(taxSetting.value) : 0;

            tour.tax_percent = taxPercent;

            // Optional: calculate tax amount if price exists
            if (tour.price) {
                const price = Number(tour.price);
                tour.tax_amount = (price * taxPercent) / 100;
                tour.total_with_tax = price + tour.tax_amount;
            }

            // ✅ Multiple images full path
            let images = [];

            if (tour.images) {
                const imageArray =
                    typeof tour.images === 'string'
                        ? JSON.parse(tour.images)
                        : tour.images;

                images = imageArray.map(img =>
                    `${process.env.APP_URL}/uploads/tour/${img}`
                );
            }

            tour.images = images;

            return res.status(200).json({
                success: true,
                message: 'Tour details fetched successfully',
                data: tour
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
    // 3️⃣ CREATE TOUR BOOKING (USER SIDE - WITHOUT LOGIN)
    // ===============================
    async createBooking(req, res) {
        try {
            const {
                tour_id,
                customer_name,
                phone_number,
                email,
                pickup_address,
                pickup_lat,
                pickup_long,
                drop_address,
                drop_lat,
                drop_long,
                travel_date,
                travel_time,
                qty,
                min_price,
                pay_price,
                price,
                gst,
                gst_price,
                final_price,
                payment_status,
                payment_method,
                payment_type
            } = req.body;

            // Validate required fields
            if (!tour_id || !phone_number || !pickup_address || !drop_address || !travel_date || !travel_time) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }

            // Verify tour exists
            const tour = await TourManagement.findByPk(tour_id);
            if (!tour) {
                return res.status(404).json({
                    success: false,
                    message: 'Tour not found'
                });
            }

            // Create order
            const order = await TourOrderManagement.create({
                tour_id,
                customer_name: customer_name || null,
                phone_number,
                email: email || null,
                pickup_address,
                pickup_lat: pickup_lat || null,
                pickup_long: pickup_long || null,
                drop_address,
                drop_lat: drop_lat || null,
                drop_long: drop_long || null,
                travel_date,
                travel_time,
                qty: qty || 1,
                min_price: min_price || 0,
                pay_price: pay_price || 0,
                price: price || 0,
                gst: gst || 0,
                gst_price: gst_price || 0,
                final_price: final_price || 0,
                payment_status: payment_status || 'pending',
                payment_method: payment_method || null,
                payment_type: payment_type || 'full',
                order_status: 0 // Pending
            });

            // Send WhatsApp confirmation message
            try {
                const message = `✅ *Booking Confirmed!* %0A%0A`
                    + `📋 *Booking ID:* ${order.id}%0A`
                    + `🗺️ *Tour:* ${tour.tour_name}%0A`
                    + `📅 *Date:* ${travel_date}%0A`
                    + `⏰ *Time:* ${travel_time}%0A`
                    + `📍 *Pickup:* ${pickup_address}%0A`
                    + `🏁 *Drop:* ${drop_address}%0A`
                    + `👥 *Persons:* ${qty || 1}%0A`
                    + `💰 *Total:* ₹${final_price}%0A%0A`
                    + `Thank you for booking with us!%0A`
                    + `Track your booking in the dashboard.`;

                const whatsappPhone = formatPhoneForWhatsApp(phone_number);
                if (whatsappPhone) {
                    await sendWhatsAppMessage(whatsappPhone, message);
                }
            } catch (whatsappError) {
                console.error("Failed to send WhatsApp confirmation:", whatsappError);
                // Don't fail the booking if WhatsApp fails
            }

            return res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: order
            });

        } catch (error) {
            console.error('Booking error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create booking',
                error: error.message
            });
        }
    }
};

module.exports = tourManageController;
