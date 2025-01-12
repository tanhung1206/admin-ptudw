const epxress = require("express");
const router = epxress.Router();
const categoriesModel = require("../model/categoriesModel");
const { pagination } = require("../config/config");
const order = [null, "name", "count desc"];
const multerConfig = require('./multerConfig');
const upload = multerConfig('public/img/categories');
const path = require("path");
const fs=require("fs");

function infoUpdateCategory(category) {
    const fieldsAsString = ['name', 'imagepath']
    const data = Object.entries(category).map(([key, value]) => {
        // Nếu cột là dạng chuỗi, bọc giá trị trong dấu nháy đơn
        if (fieldsAsString.includes(key)) {
            return `${key} = '${value.replace(/'/g, "''")}'`; // Escape dấu nháy đơn
        }
        // Cột dạng số giữ nguyên
        return `${key} = ${value}`;
    });

    return data.join(", ");
}

router.get("/add", async (req, res) => {
    res.render("add-category");
})

router.post("/add", upload.fields([
    { name: "changeMainImage", maxCount: 1 }
]), async (req, res) => {
    let imagePath = "";
    if (req.files.changeMainImage) {
        imagePath = 'http://localhost:4000/img/categories/' + req.files.changeMainImage[0].filename;
        // console.log('File uploaded: ', imagePath);
        req.body.imagepath = imagePath;
    }
    const category = req.body;
    const name = category.name;
    const findcategory = await categoriesModel.findByName(name);
    if (findcategory) {
        if (imagePath != "") {
            const deleteImg = path.join(process.cwd(), "public/img/categories", req.files.changeMainImage[0].filename);
            fs.unlink(deleteImg, (err) => {

            });
        }
        return res.render("add-category", {
            name,
            errorMessage: "Category name is exist"
        })

    }
    const rowCount = await categoriesModel.insertCategory(category);
    res.redirect("/categories");
})

router.get("/", async (req, res) => {
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

    if (sortId) {
        aQuery.push(`sortId=${sortId}`);
    }

    const query = aQuery.join("&");
    const condition = aCondition.join(" and ");


    const [categories, totalResult] = await Promise.all([
        categoriesModel.findFullByCondition(condition, pagination.limit, offset, order[sortId] || "categoryid"),
        categoriesModel.countByCondition(condition)
    ])

    const totalPages = Math.ceil(+totalResult[0].total / pagination.limit);
    const prevPage = curPage - 1 >= 1 ? curPage - 1 : undefined;
    const nextPage = curPage + 1 <= totalPages ? curPage + 1 : undefined;
    res.render("categories", {
        categories,
        name, sortId,
        curPage, totalPages, prevPage, nextPage,
        query
    });
})

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const [category] = await categoriesModel.findOne(id);
    res.render("category-details", {
        category
    })
})

router.post("/:id", upload.fields([
    { name: "changeMainImage", maxCount: 1 }
]), async (req, res) => {
    const id = req.params.id;
    let imagePath = "";
    if (req.files.changeMainImage) {
        imagePath = 'http://localhost:4000/img/categories/' + req.files.changeMainImage[0].filename;
        req.body.imagepath = imagePath;
    }
    let category = req.body;
    const name = category.name;
    const findcategory = await categoriesModel.findByName(name);
    if (findcategory) {
        if (findcategory.categoryid != id) {
            if (imagePath != "") {
                const deleteImg = path.join(process.cwd(), "public/img/categories", req.files.changeMainImage[0].filename);
                fs.unlink(deleteImg, (err) => {

                });
            }
            [category] = await categoriesModel.findOne(id);
            return res.render("category-details", {
                category,
                errorMessage: "Category name is exist"
            })
        }
    }
    const data = infoUpdateCategory(category);
    const rowCount = await categoriesModel.updateCategory(id, data);
    res.redirect(req.originalUrl);
})

module.exports = router;