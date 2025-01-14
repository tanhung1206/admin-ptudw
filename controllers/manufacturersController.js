const epxress = require("express");
const router = epxress.Router();
const manufacturersModel = require("../model/manufacturersModel");
const { pagination } = require("../config/config");
const order = [null, "name", "count desc"];
const multerConfig = require('./multerConfig');
const upload = multerConfig('public/img/manufacturers');
const path = require("path");
const fs = require("fs");

function infoUpdateManufacturer(manufacturer) {
    const fieldsAsString = ['name', 'imagepath']
    const data = Object.entries(manufacturer).map(([key, value]) => {
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
    res.render("add-manufacturer");
})

router.post("/add", upload.fields([
    { name: "changeMainImage", maxCount: 1 }
]), async (req, res) => {
    let imagePath = "";
    if (req.files.changeMainImage) {
        const DOMAIN = req.protocol + '://' + req.get('host');
        imagePath = `${DOMAIN}/img/manufacturers/` + req.files.changeMainImage[0].filename;
        // console.log('File uploaded: ', imagePath);
        req.body.imagepath = imagePath;
    }
    const manufacturer = req.body;
    const name = manufacturer.name;
    const findmanufacturer = await manufacturersModel.findByName(name);
    if (findmanufacturer) {
        if (imagePath != "") {
            const deleteImg = path.join(process.cwd(), "public/img/manufacturers", req.files.changeMainImage[0].filename);
            fs.unlink(deleteImg, (err) => {

            });
        }
        return res.render("add-manufacturer", {
            name,
            errorMessage: "Manufacturer name is exist"
        })

    }
    const rowCount = await manufacturersModel.insertManufacturer(manufacturer);
    res.redirect("/manufacturers");
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


    const [manufacturers, totalResult] = await Promise.all([
        manufacturersModel.findFullByCondition(condition, pagination.limit, offset, order[sortId] || "manufacturerid"),
        manufacturersModel.countByCondition(condition)
    ])

    const totalPages = Math.ceil(+totalResult[0].total / pagination.limit);
    const prevPage = curPage - 1 >= 1 ? curPage - 1 : undefined;
    const nextPage = curPage + 1 <= totalPages ? curPage + 1 : undefined;
    res.render("manufacturers", {
        manufacturers,
        name, sortId,
        curPage, totalPages, prevPage, nextPage,
        query
    });
})

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const [manufacturer] = await manufacturersModel.findOne(id);
    res.render("manufacturer-details", {
        manufacturer
    })
})

router.post("/:id", upload.fields([
    { name: "changeMainImage", maxCount: 1 }
]), async (req, res) => {
    const id = req.params.id;
    let imagePath = "";
    if (req.files.changeMainImage) {
        const DOMAIN = req.protocol + '://' + req.get('host');
        imagePath = `${DOMAIN}/img/manufacturers/` + req.files.changeMainImage[0].filename;
        req.body.imagepath = imagePath;
    }
    let manufacturer = req.body;
    const name = manufacturer.name;
    const findmanufacturer = await manufacturersModel.findByName(name);
    if (findmanufacturer) {
        if (findmanufacturer.manufacturerid != id) {
            if (imagePath != "") {
                const deleteImg = path.join(process.cwd(), "public/img/manufacturers", req.files.changeMainImage[0].filename);
                fs.unlink(deleteImg, (err) => {

                });
            }
            [manufacturer] = await manufacturersModel.findOne(id);
            return res.render("manufacturer-details", {
                manufacturer,
                errorMessage: "Manufacturer name is exist"
            })
        }
    }
    const data = infoUpdateManufacturer(manufacturer);
    const rowCount = await manufacturersModel.updateManufacturer(id, data);
    res.redirect(req.originalUrl);
})

module.exports = router;