const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const formidable = require('express-formidable');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./src/admin-panel/routes/adminRoutes');
const tourManageRoute = require('./src/admin-panel/routes/tourManageRoute');
const dashboardRoutes = require('./src/admin-panel/routes/dashboardRoutes');
const customerRoutes = require('./src/admin-panel/routes/customerRoutes');
const productRoutes = require('./src/admin-panel/routes/productRoutes');
const categoryRoutes = require('./src/admin-panel/routes/categoryRoutes');
const orderRoutes = require('./src/admin-panel/routes/orderRoutesNew');

const tourManageRoutes = require('./src/user-panel/routes/tourManageRoutesUpdated');
const razorPayRoutes = require('./src/user-panel/routes/razorPayRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(formidable());
app.use('/uploads', express.static('public/uploads'));

// Serve frontend static files from the build directory
app.use(express.static(path.join(__dirname, '../front/build')));

app.use('/api/admin', adminRoutes);
app.use('/api/tour', tourManageRoute);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

app.use('/v1/api/tour', tourManageRoutes);
app.use('/v1/api/razorpay', razorPayRoutes);
app.use('/v1/api/orders', tourManageRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// SPA Fallback - Serve index.html for all non-API routes (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/v1/api`);
});
