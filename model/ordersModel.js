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
            result = await db.query(`SELECT o.*, u.username FROM ${tableName} o JOIN users u ON o.userid = u.userid WHERE ${condition} ORDER BY ${orderBy} DESC LIMIT ${limit} OFFSET ${offset}`);
        } else {
            result = await db.query(`SELECT o.*, u.username FROM ${tableName} o JOIN users u ON o.userid = u.userid ORDER BY ${orderBy} DESC LIMIT ${limit} OFFSET ${offset}`);
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