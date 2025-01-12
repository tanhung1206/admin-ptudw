const express = require("express");
const UsersModel = require("../model/usersModel");
const { pagination } = require("../config/config");

const router = express.Router();

const order = {
    1: "username",
    2: "email",
    3: "createdat"
};

router.get("/", async (req, res) => {
    const isadmin = +req.query.isadmin || false;
    const search = req.query.search;
    const username = req.query.username;
    const email = req.query.email;
    const sortId = +req.query.sortId || false;
    const curPage = +req.query.page || 1;

    const offset = (curPage - 1) * pagination.limit;

    const aQuery = [];
    const aCondition = [];
    if (search) {
        aQuery.push(`search=${search}`);
        aCondition.push(`username LIKE '%${search}%' OR email LIKE '%${search}%'`);
    }
    if (email) {
        aQuery.push(`email=${email}`);
        aCondition.push(`email LIKE '%${email}%'`);
    }
    if (isadmin) {
        aQuery.push(`isadmin=${isadmin}`);
        aCondition.push(`isadmin=${isadmin}`);
    }
    if (sortId) {
        aQuery.push(`sortId=${sortId}`);
    }
    const query = aQuery.join("&");
    const condition = aCondition.join(" AND ");
    const [users, totalResult] = await Promise.all([
        UsersModel.filterByCondition(condition, pagination.limit, offset, order[sortId] || "userid"),
        UsersModel.countByCondition(condition)
    ]);

    const totalPages = Math.ceil(+totalResult[0].total / pagination.limit);
    const prevPage = curPage - 1 >= 1 ? curPage - 1 : undefined;
    const nextPage = curPage + 1 <= totalPages ? curPage + 1 : undefined;

    if (req.xhr) {
        res.json({
            users,
            curPage, totalPages, prevPage, nextPage,
            query
        });
    } else {
        res.render("accounts", {
            users,
            isadmin, username, email, sortId,
            curPage, totalPages, prevPage, nextPage,
            query
        });
    }
});

// Route to handle ban/unban requests
router.post("/:action", async (req, res) => {
    const { action } = req.params;
    const { userid } = req.body;

    if (!userid || !["ban", "unban"].includes(action)) {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }

    try {
        const isban = action === "ban";
        await UsersModel.updateUserBanStatus(userid, isban);
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating user ban status:", error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
});

module.exports = router;