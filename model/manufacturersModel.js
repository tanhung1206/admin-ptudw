const db = require("../db/db");
const tableName = "Manufacturers";

module.exports = {
    async findAll() {
        const result = await db.query(`select * from ${tableName}`);
        return result.rows;
    }
}