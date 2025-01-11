const express = require("express");
const router = express.Router();
const userModel = require("../model/usersModel");
const bcrypt = require("bcryptjs");
const { saltRound } = require("../config/config");

function restrict(req, res, next) {
    if (req.session.userid) {

        return res.redirect("/")
    }
    else {
        next();
    }
}

router.get("/login", restrict, (req, res) => {
    res.render("login", {
        layout: false
    })
})

router.get("/logout", (req, res, next) => {
    if (req.session.userid) {
        next();
    }
    else {
        res.redirect("/user/login");
    }
}, (req, res) => {
    req.session.destroy((err) => {
        if (!err) {
            res.redirect("/user/login");
        }
    })
})

router.post("/login", restrict, async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const admin = await userModel.findAdminByEmail(email);
    let errorMessage = ""
    if (admin) {
        if (bcrypt.compareSync(password, admin.password)) {
            const returnURL = req.query.returnURL;
            req.session.userid = admin.userid;
            if (returnURL) {
                return res.redirect(returnURL);
            }
            else {
                return res.redirect("/");
            }
        }
        else {
            errorMessage = "InValid Password";
        }
    }
    else {
        errorMessage = "Email not found";
    }
    res.render("login", {
        layout: false,
        errorMessage
    })
})
module.exports = router;