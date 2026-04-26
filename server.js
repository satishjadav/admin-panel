const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const { TourManagement } = require('./src/models');
require('dotenv').config();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const adminRoutes = require('./src/admin-panel/routes/adminRoutes');
const tourManageRoute = require('./src/admin-panel/routes/tourManageRoute');
const dashboardRoutes = require('./src/admin-panel/routes/dashboardRoutes');
const customerRoutes = require('./src/admin-panel/routes/customerRoutes');
const productRoutes = require('./src/admin-panel/routes/productRoutes');
const categoryRoutes = require('./src/admin-panel/routes/categoryRoutes');
const orderRoutes = require('./src/admin-panel/routes/orderRoutesNew');
const BusinessSettings = require('./src/admin-panel/routes/BusinessSettings');
const GalleryRoutes = require('./src/admin-panel/routes/GalleryRoutes');

const tourManageRoutes = require('./src/user-panel/routes/tourManageRoutesUpdated');
const razorPayRoutes = require('./src/user-panel/routes/razorPayRoutes');
const businessRoutes = require('./src/user-panel/routes/businessRoutes');
const { Hooks } = require('sequelize/lib/hooks');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0');

const allowedScriptSources = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  'https://checkout.razorpay.com',
  'https://cdn.razorpay.com',
  'https://cdn.ckeditor.com',
  'https://maps.googleapis.com',
  'https://maps.gstatic.com',
];

// Configure Helmet with CSP to allow Google Maps and Razorpay scripts
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: allowedScriptSources,
      scriptSrcElem: allowedScriptSources,
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        'https://api.razorpay.com',
        'https://checkout.razorpay.com',
        'https://cdn.razorpay.com',
        'https://maps.googleapis.com',
        'https://maps.gstatic.com',
      ],
      frameSrc: ["'self'", 'https://checkout.razorpay.com', 'https://api.razorpay.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  originAgentCluster: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));

// Serve frontend static files from the build directory
app.use(express.static(path.join(__dirname, './build')));

app.use('/api/admin', adminRoutes);
app.use('/api/tour', tourManageRoute);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gallery', GalleryRoutes);

app.use('/api/gst-settings', BusinessSettings);
app.use('/api/business-settings', BusinessSettings);

app.use('/v1/api/tour', tourManageRoutes);
app.use('/v1/api/razorpay', razorPayRoutes);
app.use('/v1/api/orders', tourManageRoutes);
app.use('/v1/api/information', businessRoutes);


const getToursFromDB = async () => {
  return await TourManagement.findAll({
    attributes: ["slug", "updated_at"],
    where: { status: 1 }
  });
};

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ✅ FIRST (sitemap should be here)
app.get("/sitemap", async (req, res) => {
  console.log("SITEMAP HIT");
  try {
    const baseUrl = `https://app.bitcat-ujjain.shop`;
    const tours = await getToursFromDB();

    const staticPages = [
      "",
      "about",
      "trips",
      "gallery",
      "contact",
      "privacy-policy",
      "terms-and-conditions",
      "cancellation-policy",
    ];

    let urls = staticPages.map(page => `
      <url><loc>${baseUrl}/${page}</loc></url>
    `).join("");

    urls += tours.map(tour => `
      <url><loc>${baseUrl}/tour-details/${tour.slug}</loc></url>
    `).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);

  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
});

// ✅ THEN static
app.use(express.static(path.join(__dirname, './build')));

// ✅ LAST (React fallback)
app.get(/^((?!api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

console.log("ENV CHECK:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  port: process.env.DB_PORT
});
app.get("/check-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Frontend: http://${HOST}:${PORT}`);
  console.log(`API: http://${HOST}:${PORT}/v1/api`);
  console.log('Production note: terminate HTTPS in Nginx and proxy requests to this internal HTTP port.');
});
