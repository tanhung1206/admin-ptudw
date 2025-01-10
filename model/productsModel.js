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
    },
    async insertProduct(product) {
        const {
            name,
            imagepath,
            price,
            quantity,
            summary,
            description,
            categoryid,
            manufacturerid,
            status
        } = product;
        const query = `
        INSERT INTO products (name,imagepath, price, quantity, summary, description, categoryid, manufacturerid, status, createdat)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, NOW())
        RETURNING productid
        `;
        try {
            const result = await db.query(query, [name, imagepath, price, quantity, summary, description, categoryid, manufacturerid, status]);
            console.log(result);
            return result.rows[0].productid;
        }
        catch (err) {
            console.error("Error inserting product:", err);
            throw err;  // Bạn có thể xử lý lỗi tại đây nếu cần
        }
    }
}