# E-commerce Admin Panel API

A complete Node.js API for managing e-commerce operations with admin panel functionality.

## Features

1. **Admin Authentication**
   - Login with JWT tokens
   - Role-based access control (super_admin/manager)

2. **Dashboard**
   - Statistics and analytics
   - Order status tracking
   - Revenue reports

3. **Customer Management**
   - Customer listing
   - Customer orders view
   - Status management

4. **Product & Category Management**
   - CRUD operations for products
   - Category and subcategory management
   - Status updates

5. **Order Management**
   - Order listing with filters
   - Order status updates
   - Payment status management

## EC2 Deployment Notes

- Run Node on internal HTTP only, ideally `127.0.0.1:3001` in production.
- Terminate HTTPS in Nginx and proxy all requests to `http://127.0.0.1:3001`.
- Use the sample config at [deploy/nginx/traveller.conf](/abs/path/c:/nodejs/traveller-react-copy/back/deploy/nginx/traveller.conf).
- Do not open `https://<public-ip>:3001` directly; use `https://<host>/` through Nginx.
- After deployment, restrict the EC2 security group so port `3001` is not public.

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/analytics` - Get sales analytics

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/orders` - Get customer orders
- `PATCH /api/customers/:id/status` - Update customer status

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/status` - Update product status

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `PATCH /api/categories/:id/status` - Update category status

### Orders
- `GET /api/orders` - List all orders (with filters)
- `GET /api/orders/:id` - Get order details with items
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/payment-status` - Update payment status
