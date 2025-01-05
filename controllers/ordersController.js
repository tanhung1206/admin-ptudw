const express = require("express");
const OrdersModel = require("../model/ordersModel");
const { pagination } = require("../config/config");

const router = express.Router();

const order = {
    1: "orderid",
    2: "customername",
    3: "orderdate"
};

router.get("/", async (req, res) => {
    const status = req.query.status;
    const search = req.query.search;
    const customername = req.query.customername;
    const sortId = +req.query.sortId || false;
    const curPage = +req.query.page || 1;

    const offset = (curPage - 1) * pagination.limit;

    const aQuery = [];
    const aCondition = [];
    if (search) {
        aQuery.push(`search=${search}`);
        aCondition.push(`customername LIKE '%${search}%' OR orderid LIKE '%${search}%'`);
    }
    if (customername) {
        aQuery.push(`customername=${customername}`);
        aCondition.push(`customername LIKE '%${customername}%'`);
    }
    if (status) {
        aQuery.push(`status=${status}`);
        aCondition.push(`status=${status}`);
    }
    if (sortId) {
        aQuery.push(`sortId=${sortId}`);
    }
    const query = aQuery.join("&");
    const condition = aCondition.join(" AND ");
    const [orders, totalResult] = await Promise.all([
        OrdersModel.filterByCondition(condition, pagination.limit, offset, order[sortId] || "createdat"),
        OrdersModel.countByCondition(condition)
    ]);

    const totalPages = Math.ceil(+totalResult[0].total / pagination.limit);
    const prevPage = curPage - 1 >= 1 ? curPage - 1 : undefined;
    const nextPage = curPage + 1 <= totalPages ? curPage + 1 : undefined;

    if (req.xhr) {
        res.json({
            orders,
            curPage, totalPages, prevPage, nextPage,
            query
        });
    } else {
        res.render("orders", {
            orders,
            status, customername, sortId,
            curPage, totalPages, prevPage, nextPage,
            query
        });
    }
});

module.exports = router;