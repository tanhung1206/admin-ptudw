const db = require("../db/db");
const tableName = "Products";

module.exports = {
    async findAll() {
        const result = await db.query(`select * from ${tableName}`);
        return result.rows;
    },
    async filterByCondition(condition, limit, offset, order = "productid") {
        let result;
        if (condition) {
            result = await db.query(`select * from ${tableName} where ${condition} order by ${order} limit ${limit} offset ${offset}`);
        }
        else {
            result = await db.query(`select * from ${tableName} order by ${order} limit ${limit} offset ${offset}`);
        }
        return result.rows;
    },
    async countByCondition(codition) {
        let result;
        if (codition) {
            result = await db.query(`select count(*) as total from ${tableName} where ${codition}`)
        }
        else {
            result = await db.query(`select count(*) as total from ${tableName}`)
        }
        return result.rows;
    },
    async findOne(id) {
        const result = await db.query(`select * from ${tableName} where productid=${id}`);
        return result.rows;
    },

    async updateProduct(id, data) {
        const result = await db.query(`update ${tableName} set ${data} where productid=${id}`);
        return result.rowCount;
    },

    async findRelatedImg(id) {
        const result = await db.query(`select * from images where productid=${id}`);
        return result.rows;
    }
}