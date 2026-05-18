const BusinessSetting = require('../models/BusinessSetting');
require('dotenv').config();


exports.getGSTSettings = async (req, res) => {
    try {
        const settings = await BusinessSetting.findAll({
            where: {
                key: [
                    'gst_percentage',
                    'gst_number',
                    'company_name',
                    'state_code'
                ]
            }
        });
        let data = {};
        settings.forEach(item => {
            data[item.key] = item.value;
        });
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false
        });
    }
};

exports.getBusinessSettings = async (req, res) => {
    try {
        const settings = await BusinessSetting.findAll({
            where: {
                key: [
                    'about_us',
                    'cancellation_policy',
                    'privacy_policy',
                    'terms_and_conditions'
                ]
            }
        });
        let data = {};
        settings.forEach(item => {
            data[item.key] = item.value;
        });
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false
        });
    }
};

exports.updateGSTSettings = async (req, res) => {
    try {

        const {
            gst_percentage,
            gst_number,
            company_name,
            state_code
        } = req.body;

        const settings = {
            gst_percentage,
            gst_number,
            company_name,
            state_code
        };

        for (const key in settings) {

            const value = settings[key];

            const existing = await BusinessSetting.findOne({
                where: { key: key }
            });

            if (existing) {
                existing.value = value;
                await existing.save();
            } else {
                await BusinessSetting.create({
                    key: key,
                    value: value
                });
            }

        }

        res.json({
            success: true,
            message: "GST Settings Updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

exports.updateBusinessSettings = async (req, res) => {
    try {

        const {
            about_us,
            cancellation_policy,
            privacy_policy,
            terms_and_conditions,
        } = req.body;

        const settings = {
            about_us,
            cancellation_policy,
            privacy_policy,
            terms_and_conditions,
        };

        for (const key in settings) {

            const value = settings[key];

            const existing = await BusinessSetting.findOne({
                where: { key: key }
            });

            if (existing) {
                existing.value = value;
                await existing.save();
            } else {
                await BusinessSetting.create({
                    key: key,
                    value: value
                });
            }
        }

        res.json({
            success: true,
            message: "Business Settings Updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};