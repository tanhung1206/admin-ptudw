const db = require("../db/db");
const tableName = "Categories";

module.exports = {
    async findAll() {
        const result = await db.query(`select * from ${tableName}`);
        return result.rows;
    },
    async findFull() {
        const result = await db.query(`select ${tableName}.*,
            (select count(products.productid) from products where products.categoryid=categories.categoryid) as count
            from ${tableName}`)
        return result.rows;
    },
    async findOne(id) {
        const result = await db.query(`select ${tableName}.*,
            (select count(products.productid) from products where products.categoryid=categories.categoryid) as count
            from ${tableName} where categoryid=${id}`);
        return result.rows;
    },

    async findFullByCondition(condition, limit, offset, order = "categoryid") {
        let result;
        if (condition) {
            result = await db.query(`select ${tableName}.*,
            (select count(products.productid) from products where products.categoryid=categories.categoryid) as count
            from ${tableName} where ${condition} order by ${order} limit ${limit} offset ${offset}`);
        }
        else {
            result = await db.query(`select ${tableName}.*,
                (select count(products.productid) from products where products.categoryid=categories.categoryid) as count
                from ${tableName} order by ${order} limit ${limit} offset ${offset}`);
        }
        return result.rows;
    },
    async countByCondition(condition) {
        let result;
        if (condition) {
            result = await db.query(`select count(*) as total from ${tableName} where ${condition}`);
        }
        else {
            result = await db.query(`select count(*) as total from ${tableName}`)
        }
        return result.rows;
    },
    async findByName(name) {
        const result = await db.query(`select * from ${tableName} where name='${name}'`);
        return result.rows[0];
    },
    async updateCategory(id, data) {
        const result = await db.query(`update ${tableName} set ${data} where categoryid=${id}`);
        return result.rowCount;
    },
    async insertCategory(category) {
        const { name, imagepath } = category;
        const result = await db.query(`insert into ${tableName} (name,imagepath) values($1,$2)`, [name, imagepath]);
        return result.rowCount;
    }
}