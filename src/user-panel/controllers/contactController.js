const Contact = require('../models/Contact');
const Admin = require('../../admin-panel/models/Admin');
const firebaseAdmin = require('../../config/firebase');

exports.store = async (req, res) => {
  try {
    const { name, message,phone } = req.body;
    // validation
    if (!name || !phone || !message) {
      return res.status(400).json({
        messages: 'All fields are required'
      });
    }
    const contact = await Contact.create({
      name:name,
      phone:phone,
      message:message
    });

    return res.status(201).json({
      message: 'Contact saved successfully',
      data: contact
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error'
    });
  }
};

exports.storeInquiry = async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required.' });
    }

    const sanitizedPhone = phone.toString().replace(/[^0-9]/g, '');
    if (!sanitizedPhone) {
      return res.status(400).json({ message: 'Phone number must contain digits.' });
    }

    const inquiry = await Contact.create({
      name,
      phone: sanitizedPhone,
      message: message || `New booking lead from ${name}`
    });

    const tokens = await Admin.getAllFcmTokens();
    if (tokens && tokens.length > 0 && firebaseAdmin?.messaging) {
      const payload = {
        notification: {
          title: 'New Booking Lead',
          body: `New lead from ${name} (${sanitizedPhone})`
        },
        data: {
          type: 'new_lead',
          sender_name: name,
          sender_phone: sanitizedPhone
        },
        tokens
      };

      try {
        const response = await firebaseAdmin.messaging().sendEachForMulticast(payload);
        console.log('Inquiry push notification sent to admins:', response.successCount, response.failureCount);
      } catch (pushError) {
        console.error('Push notification error for inquiry:', pushError);
      }
    }

    return res.status(201).json({
      message: 'Inquiry saved successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Inquiry store error:', error);
    return res.status(500).json({
      message: 'Server error'
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [['id', 'DESC']]
    });

    return res.status(200).json({
      data: contacts
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error'
    });
  }
};