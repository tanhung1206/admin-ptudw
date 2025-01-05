const express = require("express");
const OrdersModel = require("../model/ordersModel");
const { pagination } = require("../config/config");

const router = express.Router();

const order = {
    1: "username",
    2: "total",
    3: "createdat"
};

router.get("/", async (req, res) => {
    const statusId = req.query.statusId;
    const search = req.query.search;
    const sortId = +req.query.sortId || false;
    const curPage = +req.query.page || 1;

    const offset = (curPage - 1) * pagination.limit;

    const aQuery = [];
    const aCondition = [];
    if (search) {
        aQuery.push(`search=${search}`);
        aCondition.push(`username LIKE '%${search}%' OR orderid LIKE '%${search}%'`);
    }
    if (statusId) {
        aQuery.push(`statusId=${statusId}`);
        aCondition.push(`status=${statusId}`);
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
            statusId, search, sortId,
            curPage, totalPages, prevPage, nextPage,
            query
        });
    }
});

module.exports = router;
