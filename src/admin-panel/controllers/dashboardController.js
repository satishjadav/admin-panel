const { pool } = require('../../config/database');

const dashboardController = {
  // Get dashboard statistics
  getStats: async (req, res) => {
    // try {
      // Execute multiple queries in parallel
      const [
        [totalOrders],
        [totalCustomers],
        [totalProducts],
        [totalCategories],
        [revenue],
        orderStatusStats,
        recentOrders,
        revenueStats
      ] = await Promise.all([
        pool.execute('SELECT COUNT(*) as count FROM tour_orders'),
        pool.execute('SELECT COUNT(*) as count FROM customers'),
        pool.execute('SELECT COUNT(*) as count FROM tour_management'),
        pool.execute('SELECT COUNT(*) as count FROM tour_orders where order_status=3'),
        pool.execute('SELECT sum(final_price) as count FROM tour_orders where order_status=3'),
        pool.execute(`
          SELECT 
            order_status,
            COUNT(*) as count
          FROM tour_orders
          GROUP BY order_status
        `),
        pool.execute(`
          SELECT o.*, c.first_name as customer_name
          FROM tour_orders o
          LEFT JOIN customers c ON o.user_id = c.id
          ORDER BY o.created_at DESC
          LIMIT 10
        `),
        pool.execute(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as order_count,
            SUM(pay_price) as revenue
          FROM tour_orders
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `)
      ]);

      // Format order status stats
      const orderStats = {};
      if(Array.isArray(orderStatusStats)) {
        orderStatusStats.forEach(stat => {
          orderStats[stat.order_status] = stat.count;
        });
      }

      res.json({
        success: true,
        data: {
          totals: {
            orders: totalOrders[0].count,
            customers: totalCustomers[0].count,
            products: totalProducts[0].count,
            revenue: revenue[0].count,
            categories: totalCategories[0].count
          },
          orderStatus: orderStats,
          recentOrders: recentOrders[0],
          revenueStats: revenueStats[0]
        }
      });

    // } catch (error) {
    //   console.error('Dashboard stats error:', error);
    //   res.status(500).json({
    //     success: false,
    //     message: 'Server error'
    //   });
    // }
  },

  // Get sales analytics
  getSalesAnalytics: async (req, res) => {
    try {
      const { period = 'week' } = req.query;

      let dateFormat, interval;
      switch (period) {
        case 'day':
          dateFormat = '%H:00';
          interval = 'DAY';
          break;
        case 'month':
          dateFormat = '%Y-%m-%d';
          interval = 'MONTH';
          break;
        case 'year':
          dateFormat = '%Y-%m';
          interval = 'YEAR';
          break;
        default: // week
          dateFormat = '%Y-%m-%d';
          interval = 'DAY';
      }

      const [salesData] = await pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, ?) as period,
          COUNT(*) as order_count,
          SUM(total_amount) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 ${interval})
        GROUP BY DATE_FORMAT(created_at, ?)
        ORDER BY period
      `, [dateFormat, dateFormat]);

      res.json({
        success: true,
        data: salesData
      });

    } catch (error) {
      console.error('Sales analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = dashboardController;
