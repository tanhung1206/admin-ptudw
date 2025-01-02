const express = require("express");
const router = express.Router();
const productsModel = require("../model/productsModel");
const categoriesModel = require("../model/categoriesModel");
const manufacturersModel = require("../model/manufacturersModel");
const order = [null, "createdat", "price", "sold_quantity"];
const { pagination } = require("../config/config");

router.get("/", async (req, res) => {
    const categoryId = +req.query.categoryId || false;
    const manufacturerId = +req.query.manufacturerId || false;
    const name = req.query.name;
    const sortId = +req.query.sortId || false;
    const curPage = +req.query.page || 1;

    const offset = (curPage - 1) * pagination.limit;

    const aQuery = [];
    const aCondition = [];
    if (name) {
        aQuery.push(`name=${name}`);
        aCondition.push(`name ilike '%${name}%'`);
    }
    if (categoryId) {
        aQuery.push(`categoryId=${categoryId}`);
        aCondition.push(`categoryId=${categoryId}`);
    }
    if (manufacturerId) {
        aQuery.push(`manufacturerId=${manufacturerId}`);
        aCondition.push(`manufacturerId=${manufacturerId}`);
    }
    if (sortId) {
        aQuery.push(`sortId=${sortId}`);
    }
    const query = aQuery.join("&");
    const condition = aCondition.join(" and ");
    const [products, categories, manufacturers, totalResult] = await Promise.all([
        productsModel.filterByCondition(condition, pagination.limit, offset, order[sortId] || "productid"),
        categoriesModel.findAll(),
        manufacturersModel.findAll(),
        productsModel.countByCondition(condition)]);

    const totalPages = Math.ceil(+totalResult[0].total / pagination.limit);
    const prevPage = curPage - 1 >= 1 ? curPage - 1 : undefined;
    const nextPage = curPage + 1 <= totalPages ? curPage + 1 : undefined;
    res.render("products", {
        products, categories, manufacturers,
        categoryId, manufacturerId, name, sortId,
        curPage, totalPages, prevPage, nextPage,
        query
    })
})

module.exports = router;