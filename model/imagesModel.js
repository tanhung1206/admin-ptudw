const db = require('../db/db');
const tableName = "images";

module.exports = {
    async insertImg(imagepath, productid) {
        const result = await db.query(`insert into ${tableName}(imagepath,productid) values($1,$2)`, [imagepath, productid]);
        return result.rowCount;
    },
    async insertMultiImg(values) {
        const result = await db.query(`insert into ${tableName} (imagepath, productid) values ${values}`);
        return result.rowCount;
    },
    async deleteMultiImg(deletedImages) {
        const result = await db.query(`delete from ${tableName} where imageid in (${deletedImages})`);
        return result.rowCount;
    }

};