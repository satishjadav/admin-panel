const BusinessSetting = require('../../models/business_setting');


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
    }
    
};

module.exports = businessController;
