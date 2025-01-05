const db = require('../db/db');

const tableName = "orders";

module.exports = {
    async findAll() {
        const result = await db.query(`SELECT * FROM ${tableName}`);
        return result.rows;
    },

    async filterByCondition(condition, limit, offset, orderBy = "orderid") {
        let result;
        if (condition) {
            result = await db.query(`SELECT o.*, u.username, 
            CASE 
                WHEN o.status = 0 THEN 'Pending'
                WHEN o.status = 1 THEN 'Processing'
                WHEN o.status = 2 THEN 'Completed'
                WHEN o.status = 3 THEN 'Cancelled'
            END as status
            FROM ${tableName} o 
            JOIN users u ON o.userid = u.userid 
            WHERE ${condition} 
            ORDER BY ${orderBy} DESC 
            LIMIT ${limit} 
            OFFSET ${offset}`);
        } else {
            result = await db.query(`SELECT o.*, u.username, 
            CASE 
                WHEN o.status = 0 THEN 'Pending'
                WHEN o.status = 1 THEN 'Processing'
                WHEN o.status = 2 THEN 'Completed'
                WHEN o.status = 3 THEN 'Cancelled'
            END as status
            FROM ${tableName} o 
            JOIN users u ON o.userid = u.userid 
            ORDER BY ${orderBy} DESC 
            LIMIT ${limit} 
            OFFSET ${offset}`);
        }
        return result.rows;
    },

    async countByCondition(condition) {
        let result;
        if (condition) {
            result = await db.query(`SELECT COUNT(*) as total FROM ${tableName} WHERE ${condition}`);
        } else {
            result = await db.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        }
        return result.rows;
    },

    async findById(orderid) {
        const query = `
        SELECT o.*, u.username, 
        CASE 
            WHEN o.status = 0 THEN 'Pending'
            WHEN o.status = 1 THEN 'Processing'
            WHEN o.status = 2 THEN 'Completed'
            WHEN o.status = 3 THEN 'Cancelled'
        END as status
        FROM ${tableName} o 
        JOIN users u ON o.userid = u.userid 
        WHERE o.orderid = $1
        `;
        const rows = await db.query(query, [orderid]);
        return rows.rows;
    },

    async updateStatus(orderid, status) {
        const query = `UPDATE orders SET status = $1 WHERE orderid = $2`;
        const result = await db.query(query, [status, orderid]);
        return result.rowCount > 0;
    },

    async findOrderDetails(orderid) {
        const query = `
        SELECT p.name, p.price, o.quantity, (p.price * o.quantity) AS totalprice
        FROM orderdetails o
        JOIN products p ON o.productid = p.productid
        WHERE orderid = $1
        `;
        const result = await db.query(query, [orderid]);
        return result.rows;
    }
};