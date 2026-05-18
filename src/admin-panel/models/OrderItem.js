const { pool } = require('../../config/database');

const OrderItem = {
  create: async (orderId, items) => {
    const values = items.map(item => [
      orderId,
      item.product_id,
      item.product_name,
      item.price,
      item.quantity,
      item.total
    ]);

    await pool.execute(
      `INSERT INTO order_items 
       (order_id, product_id, product_name, price, quantity, total)
       VALUES ?`,
      [values]
    );
  }
};

module.exports = OrderItem;
