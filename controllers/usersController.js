const express = require("express");
const router = express.Router();
const userModel = require("../model/usersModel");
const bcrypt = require("bcryptjs");
const { saltRound } = require("../config/config");
const multerConfig = require("./multerConfig");
const upload = multerConfig("public/img");
const fs = require("fs");
const path = require("path");

function restrictLogin(req, res, next) {
    if (req.session.userid) {
        return res.redirect("/")
    }
    else {
        next();
    }
}

async function restrict(req, res, next) {
    if (req.session.userid) {
        const admin = await userModel.findAdminById(req.session.userid);
        res.locals.admin = admin;
        next();
    }
    else {
        res.redirect(`/user/login?returnURL=${req.originalUrl}`);
    }
}

router.get("/login", restrictLogin, (req, res) => {
    res.render("login", {
        layout: false
    })
})

router.get("/logout", restrict, (req, res) => {
    req.session.destroy((err) => {
        if (!err) {
            res.redirect("/user/login");
        }
    })
})

router.post("/login", restrictLogin, async (req, res) => {
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

router.get("/profile", restrict, (req, res, next) => {
    res.render("profile");
})

function infoUpdateUser(user) {
    const fieldsAsString = ['username', 'firstname', 'lastname', 'avatar']
    const data = Object.entries(user).map(([key, value]) => {
        // Nếu cột là dạng chuỗi, bọc giá trị trong dấu nháy đơn
        if (fieldsAsString.includes(key)) {
            return `${key} = '${value.replace(/'/g, "''")}'`; // Escape dấu nháy đơn
        }
        // Cột dạng số giữ nguyên
        return `${key} = ${value}`;
    });

    return data.join(", ");
}

router.post("/profile", restrict, upload.fields([
    { name: "changeAvatar", maxCount: 1 },
]), async (req, res, next) => {
    let avatar = ""
    if (req.files.changeAvatar) {
        avatar = '/img/' + req.files.changeAvatar[0].filename;
        req.body.avatar = avatar;
    }
    const user = req.body;
    const username = user.username;
    const finduser = await userModel.findByUserName(username);
    if (finduser) {
        if (finduser.userid != req.session.userid) {
            if (avatar != "") {
                const deleteImg = path.join(process.cwd(), "public", avatar);
                fs.unlink(deleteImg, (err) => {

                });
            }
            return res.render("profile", {
                errorMessage: "Username is exist"
            })
        }
    }

    const data = infoUpdateUser(user);
    const rowCount = await userModel.updateUser(req.session.userid, data);
    res.redirect(req.originalUrl);

})

router.get("/password", restrict, (req, res) => {
    res.render("password");
})

router.post("/password", restrict, async (req, res) => {
    const { currentPassword, newPassword, retypeNewPassword } = req.body;
    let errorMessage = "";
    const passwordb = res.locals.admin.password;
    if (!bcrypt.compareSync(currentPassword, passwordb)) {
        errorMessage = "Password incorrect";
    }
    else {
        if (newPassword != retypeNewPassword) {
            errorMessage = "Retype password does not match";
        }
        else {
            const password_hash = bcrypt.hashSync(newPassword, saltRound);
            const rowCount = await userModel.updatePassword(req.session.userid, password_hash);
            return res.render("password", {
                success: true
            })
        }
    }
    return res.render("password", {
        errorMessage,currentPassword, newPassword, retypeNewPassword
    })
})
module.exports = router;