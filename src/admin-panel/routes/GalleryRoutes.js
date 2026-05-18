const express = require('express');
const router = express.Router();
const fs = require("fs");
const multer = require('multer');
const path = require("path");
const GalleryController = require('../controllers/GalleryController');
const { verifyToken } = require('../middleware/auth');

const uploadPath = path.join(__dirname, "../../../public/uploads/gallery");

// 👉 create folder if not exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);   // ✅ FIXED
    },
    filename: (req, file, cb) => {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    },
});

const upload = multer({ storage });

// Protected routes
router.post('/add', verifyToken, upload.single('image'), GalleryController.uploadImage);
router.get('/delete/:id', verifyToken, GalleryController.deleteImage);
router.get('/list', GalleryController.getImages);

module.exports = router;