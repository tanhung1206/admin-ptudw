const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const express_handle_sections = require("express-handlebars-sections");
const { ppid } = require("process");
const session = require("express-session");
const userModel = require("./model/usersModel");

const app = express();

app.engine("hbs", engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "/views/layouts"),
    partialsDir: path.join(__dirname, "/views/partials"),
    helpers: {
        section: express_handle_sections(),
        eq: (a, b) => a === b,                                  // Định nghĩa helper 'eq'
        neq: (a, b) => a !== b,
        for: function (from, to, block) {
            let accum = '';
            for (let i = from; i <= to; i++) {
                accum += block.fn(i); // Render nội dung trong {{#for}}...{{/for}} với giá trị i
            }
            return accum;
        },
        gte: function (a, b) {
            return a >= b;
        },
        lte: function (a, b) {
            return a <= b;
        },
        gt: function (a, b) {
            return a > b;
        },
        subtract: function (a, b) {
            return a - b;
        },
        add: function (a, b) {
            return a + b;
        },
        inRange: function (value, a, b) {
            return value >= a && value <= b;
        }
    }
}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "/public")))

app.use(session({
    secret: "default-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false
    }
}));

app.use("/user", require("./controllers/usersController"));

app.use(async (req, res, next) => {
    if (req.session.userid) {
        const admin = await userModel.findAdminById(req.session.userid);
        res.locals.admin = admin;
        next();
    }
    else {
        res.redirect(`/user/login?returnURL=${req.originalUrl}`);
    }
})
app.get("/", (req, res) => {
    res.render("dashboard");
});

app.use("/products", require("./controllers/productsController"));
app.use("/accounts", require("./controllers/accountsController"));
app.use("/orders", require("./controllers/ordersController"));
app.use("/categories", require("./controllers/categoriesController"));
app.use("/manufacturers", require("./controllers/manufacturersController"));
app.use("/dashboard", require("./controllers/dashboardController"));
app.use("/api/products", require("./controllers/apiProductsController"));

app.get("/buttons", (req, res) => {
    res.render("buttons");
})

app.get("/dropdowns", (req, res) => {
    res.render("dropdowns");
})

app.get("/typography", (req, res) => {
    res.render("typography");
})

app.get("/forms", (req, res) => {
    res.render("basic_elements");
})

app.get("/tables", (req, res) => {
    res.render("basic-table");
})

app.get("/charts", (req, res) => {
    res.render("chartjs");
})

app.get("/icons", (req, res) => {
    res.render("mdi");
})

app.get("/blank-page", (req, res) => {
    res.render("blank-page");
})

app.get("/error-404", (req, res) => {
    res.render("error-404", {
        layout: "error"
    })
})

app.get("/error-500", (req, res) => {
    res.render("error-500", {
        layout: "error"
    })

})


app.get
app.listen(4000, () => {
    console.log(`Server is running on port ${4000}`);
})
