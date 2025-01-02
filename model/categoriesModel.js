const db = require("../db/db");
const tableName = "Categories";

module.exports = {
    async findAll() {
        const result = await db.query(`select * from ${tableName}`);
        return result.rows;
    }
}