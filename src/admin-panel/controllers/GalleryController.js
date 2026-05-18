const fs = require("fs");
const path = require("path");
const Gallery = require("../models/Gallery");

// 👉 Upload Image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: req.file });
    }
    const image = req.file.filename;

    const data = await Gallery.create({ image });

    res.json({
      status: true,
      message: "Image uploaded successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get All Images
exports.getImages = async (req, res) => {
  try {
    const images = await Gallery.findAll({
      order: [["id", "DESC"]],
    });

    const imageUrls = images.map(img => ({
      image: `${process.env.APP_URL}/uploads/gallery/${img.image}`,
      id: img.id,
    }));

    res.json(imageUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Delete Image
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const imageData = await Gallery.findByPk(id);

    if (!imageData) {
      return res.status(404).json({ message: "Image not found" });
    }

    // delete file from folder
    const filePath = path.join(__dirname, "../../../public/uploads/gallery", imageData.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await imageData.destroy();
    res.json({
      status: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};