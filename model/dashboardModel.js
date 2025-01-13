const db = require("../db/db");

const getRevenueData = async (timeRange) => {
    const query = timeRange === 'day' ? `
        SELECT DATE_TRUNC('hour', createdAt) AS date, SUM(total) AS revenue 
        FROM Orders 
        WHERE createdAt >= NOW() - INTERVAL '1 day' 
        GROUP BY DATE_TRUNC('hour', createdAt)
        ORDER BY date ASC;
    ` : `
        SELECT DATE(createdAt) AS date, SUM(total) AS revenue 
        FROM Orders 
        WHERE createdAt >= NOW() - INTERVAL '1 ${timeRange}' 
        GROUP BY DATE(createdAt)
        ORDER BY date ASC;
    `;
    const result = await db.query(query); // Không cần truyền tham số
    return result.rows;
};

const getTopProductsData = async (timeRange) => {
    const query = `
        SELECT p.name AS product_name, SUM(od.quantity * p.price) AS revenue 
        FROM Orders o
        JOIN OrderDetails od ON o.orderId = od.orderId
        JOIN Products p ON od.productId = p.productId
        WHERE o.createdAt >= NOW() - INTERVAL '1 ${timeRange}'
        GROUP BY p.name
        ORDER BY revenue DESC
        LIMIT 10;
    `;
    const result = await db.query(query); // Không cần truyền tham số
    return result.rows;
};

module.exports = { getRevenueData, getTopProductsData };