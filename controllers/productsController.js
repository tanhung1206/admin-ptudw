const express = require("express");
const router = express.Router();
const productsModel = require("../model/productsModel");
const categoriesModel = require("../model/categoriesModel");
const manufacturersModel = require("../model/manufacturersModel");

router.get("/", async (req, res) => {
    const categoryId = +req.query.categoryId || false;
    const manufacturerId = +req.query.manufacturerId || false;
    const name = req.query.name;
    const sortId = +req.query.sortId || false;
    const [products, categories, manufacturers] = await Promise.all([productsModel.findAll(), categoriesModel.findAll(), manufacturersModel.findAll()]);
    res.render("products", {
        products, categories, manufacturers, categoryId, manufacturerId, name, sortId
    })
})

module.exports = router;