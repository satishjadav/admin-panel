const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TourOrderManagement = sequelize.define(
    'TourOrderManagement',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        tour_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        customer_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },

        pickup_address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        pickup_lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },

        pickup_long: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },

        drop_address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        drop_lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },

        drop_long: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },

        travel_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        travel_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },

        min_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        pay_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        gst: {
            type: DataTypes.DECIMAL(5, 2), // example: 18.00
            allowNull: false,
        },

        gst_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        final_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        transaction_id: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        payment_status: {
            type: DataTypes.ENUM('pending', 'paid', 'failed'),
            allowNull: false,
            defaultValue: 'pending',
        },

        payment_method: {
            type: DataTypes.ENUM('upi', 'card', 'netbanking', 'wallet', 'cash', 'cheque', 'bank_transfer'),
            allowNull: true,
        },
        payment_type: {
            type: DataTypes.ENUM('full', 'partial'),
            allowNull: false,
            defaultValue: 'full',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'tour_orders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

module.exports = TourOrderManagement;