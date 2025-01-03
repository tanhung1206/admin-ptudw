const db = require('../db/db');
const tableName = "users";

module.exports = {
    async findAll() {
        const result = await db.query(`SELECT * FROM ${tableName}`);
        return result.rows;
    },

    async filterByCondition(condition, limit, offset, orderBy = "userid") {
        let result;
        if (condition) {
            result = await db.query(`SELECT * FROM ${tableName} WHERE ${condition} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`);
        } else {
            result = await db.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`);
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