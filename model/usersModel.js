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
    },

    async findAdminByEmail(email) {
        const result = await db.query(`select * from ${tableName} where email='${email}' and isadmin=true`);
        return result.rows[0];
    },
    async findAdminById(id) {
        const result = await db.query(`select * from ${tableName} where userid =${id} and isadmin=true`);
        return result.rows[0];
    },

    async findByUserName(username) {
        const result = await db.query(`select * from ${tableName} where username='${username}'`);
        return result.rows[0];
    },

    async updateUser(id, data) {
        const result = await db.query(`update ${tableName} set ${data} where userid=${id}`);
        return result.rowCount;
    },
    async updatePassword(id, password) {
        const result = await db.query(`update ${tableName} set password='${password}'`);
        return result.rowCount;
    },

    async updateUserBanStatus(userid, isban) {
        const query = `UPDATE ${tableName} SET isban = $1 WHERE userid = $2`;
        const result = await db.query(query, [isban, userid]);
        return result.rowCount;
    },

    async findById(id) {
        const result = await db.query(`select * from ${tableName} where userid=${id}`);
        return result.rows[0];
    },
};