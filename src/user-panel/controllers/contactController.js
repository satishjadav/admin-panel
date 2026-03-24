const contactController = require('../models/Contact');

exports.store = async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    // validation
    if (!name || !phone || !message) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const contact = await contactController.create({
      name,
      phone,
      message
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

exports.getAll = async (req, res) => {
  try {
    const contacts = await contactController.findAll({
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