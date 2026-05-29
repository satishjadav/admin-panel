const BusinessSetting = require('../../models/business_setting');
const Admin = require('../../admin-panel/models/Admin');
const firebaseAdmin = require('../../config/firebase');

const businessController = {

    async aboutUs(req, res) {
        try {
            const aboutUs = await BusinessSetting.findOne({
                where: { key: 'about_us' }
            });

            if (!aboutUs) {
                return res.status(404).json({
                    success: false,
                    message: 'not found Data'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'fetched successfully',
                data: aboutUs
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    async cancellationPolicy(req, res) {
        try {
            const cancellation_policy = await BusinessSetting.findOne({
                where: { key: 'cancellation_policy' }
            });

            if (!cancellation_policy) {
                return res.status(404).json({
                    success: false,
                    message: 'not found Data'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'fetched successfully',
                data: cancellation_policy
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    
    async privacyPolicy(req, res) {
        try {
            const privacyPolicy = await BusinessSetting.findOne({
                where: { key: 'privacy_policy' }
            });

            if (!privacyPolicy) {
                return res.status(404).json({
                    success: false,
                    message: 'not found Data'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'fetched successfully',
                data: privacyPolicy
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    async termsAndConditions(req, res) {
        try {
            const termsAndConditions = await BusinessSetting.findOne({
                where: { key: 'terms_and_conditions' }
            });

            if (!termsAndConditions) {
                return res.status(404).json({
                    success: false,
                    message: 'not found Data'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'fetched successfully',
                data: termsAndConditions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Send booking success notification to admins
  async sendBookingSuccessNotification (req, res) {
    try {
      let { booking_id, title, message } = req.body || {};
      if (typeof req.body === 'string' && req.body.trim()) {
        try {
          const parsed = JSON.parse(req.body);
          booking_id = parsed.booking_id;
          title = parsed.title;
          message = parsed.message;
        } catch (parseError) {
          console.warn('Unable to parse raw request body as JSON:', parseError.message);
        }
      }
      
      const tokens = await Admin.getAllFcmTokens();
      console.log('Received booking success notification request:', { booking_id, title, message, body: tokens });
      if (!tokens || tokens.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No admin device tokens found to send notification.'
        });
      }

      const notificationTitle = title || 'Booking Success';
      const notificationBody = message || `Booking ${booking_id ? `#${booking_id} ` : ''}has been confirmed successfully.`;

      const payload = {
        notification: {
          title: notificationTitle,
          body: notificationBody
        },
        data: {
          booking_id: booking_id ? String(booking_id) : '',
          type: 'booking_success'
        },
        tokens
      };

      const response = await firebaseAdmin.messaging().sendEachForMulticast(payload);

      return res.json({
        success: true,
        message: 'Booking success notification sent to admins.',
        sentCount: response.successCount,
        failureCount: response.failureCount
      });
    } catch (error) {
      console.error('Send booking success notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send booking success notification.',
        error: error.message
      });
    }
  },

    
};

module.exports = businessController;
