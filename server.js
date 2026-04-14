const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
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

const tourManageRoutes = require('./src/user-panel/routes/tourManageRoutesUpdated');
const razorPayRoutes = require('./src/user-panel/routes/razorPayRoutes');
const businessRoutes = require('./src/user-panel/routes/businessRoutes');
const { Hooks } = require('sequelize/lib/hooks');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure Helmet with CSP to allow Google Maps and Razorpay scripts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com", "https://api.razorpay.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
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

app.use('/api/gst-settings', BusinessSettings);
app.use('/api/business-settings', BusinessSettings);

app.use('/v1/api/tour', tourManageRoutes);
app.use('/v1/api/razorpay', razorPayRoutes);
app.use('/v1/api/orders', tourManageRoutes);
app.use('/v1/api/information', businessRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// SPA Fallback - Serve index.html for all non-API routes (React Router support)
// Use a regex pattern instead of '*' for Express 5 compatibility
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

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/v1/api`);
});
