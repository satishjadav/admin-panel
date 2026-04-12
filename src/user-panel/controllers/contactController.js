const Contact = require('../models/Contact');

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