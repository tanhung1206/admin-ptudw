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
    }
};