const express = require("express");
const router = express.Router();
const productsModel = require("../model/productsModel");
const categoriesModel = require("../model/categoriesModel");
const manufacturersModel = require("../model/manufacturersModel");
const order = [null, "createdat", "price", "sold_quantity"];
const { pagination } = require("../config/config");
const multerConfig = require('./multerConfig');
const upload = multerConfig('public/img/products');
const imagesModel = require("../model/imagesModel");

function infoUpdateProduct(product) {
    const fieldsAsString = ['name', 'summary', 'description', 'status', 'imagepath']
    const data = Object.entries(product).map(([key, value]) => {
        // Nếu cột là dạng chuỗi, bọc giá trị trong dấu nháy đơn
        if (fieldsAsString.includes(key)) {
            return `${key} = '${value.replace(/'/g, "''")}'`; // Escape dấu nháy đơn
        }
        // Cột dạng số giữ nguyên
        return `${key} = ${value}`;
    });

    return data.join(", ");
}

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
});

router.get("/add", async (req, res) => {
    const [categories, manufacturers] = await Promise.all([
        categoriesModel.findAll(),
        manufacturersModel.findAll(),
    ]);
    res.render("add-product", {
        categories,
        manufacturers
    });
})

router.post("/add", upload.fields([
    { name: "changeMainImage", maxCount: 1 },
    { name: "relatedImages", maxCount: 10 }
]), async (req, res) => {
    if (req.files.changeMainImage) {
        const imagePath = '/img/products/' + req.files.changeMainImage[0].filename;
        console.log('File uploaded: ', imagePath);
        req.body.imagepath = imagePath;
    }
    else {
        console.log("khong co main img");
    }
    const product = req.body;

    const id = await productsModel.insertProduct(product);

    if (req.files.relatedImages) {
        const relatedImages = req.files.relatedImages.map(file => "/img/products/" + file.filename);
        console.log('Related Images:', relatedImages);
        const values = relatedImages.map(imgPath => `('${imgPath}', ${id})`).join(", ");
        await imagesModel.insertMultiImg(values);
    }

    res.redirect("/products");
});



router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const [[product], categories, manufacturers, relatedImages] = await Promise.all([productsModel.findOne(id),
    categoriesModel.findAll(),
    manufacturersModel.findAll(),
    productsModel.findRelatedImg(id)
    ]);

    res.render("product-details", {
        product,
        categories,
        manufacturers,
        relatedImages
    })

})


router.post("/:id", upload.fields([
    { name: "changeMainImage", maxCount: 1 },
    { name: "relatedImages", maxCount: 10 }
]),
    async (req, res) => {
        const id = req.params.id;
        if (req.files.changeMainImage) {
            const imagePath = '/img/products/' + req.files.changeMainImage[0].filename;
            console.log('File uploaded: ', imagePath);
            req.body.imagepath = imagePath;
        }
        else {
            console.log("khong co main img");
        }
        if (req.files.relatedImages) {
            const relatedImages = req.files.relatedImages.map(file => "/img/products/" + file.filename);
            console.log('Related Images:', relatedImages);
            const values = relatedImages.map(imgPath => `('${imgPath}', ${id})`).join(", ");
            await imagesModel.insertMultiImg(values);
        }

        const product = req.body;
        const deletedImages = product.deletedImages;
        if (deletedImages) {
            delete product.deletedImages;
            try {
                deletedImages = deletedImages.join(",")
            }
            catch (e) {

            }
            await imagesModel.deleteMultiImg(deletedImages);
        }
        const data = infoUpdateProduct(product);
        const rowCount = await productsModel.updateProduct(id, data);
        res.redirect(req.originalUrl)
    });



module.exports = router;