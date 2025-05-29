const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middleware/auth");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/UserRoutes");
const TransactionRouter = require("./routes/TransactionRoutes");
const NotificationRouter = require("./routes/NotificationRoutes");
const CategoryRouter = require("./routes/CategoryRoutes");
const BudgetRouter = require("./routes/BudgetRoutes");
const reportRoutes = require('./routes/reportRoutes');

const app = express();

if (process.env.JWT_SECRET === undefined)
    console.warn(
        "\x1b[43mWarning\x1b[0m\x1b[33m: JWT_SECRET is not set in the environment variables. Using default value, this is unsafe.\x1b[0m"
    );

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors({ origin: "*" })); // CORS allow all
app.use(authMiddleware);

mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fin-analy-db")
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

const prefix = process.env.API_PREFIX || "/api";
app.use(prefix, indexRouter);
app.use(`${prefix}/users`, usersRouter);
app.use(`${prefix}/transactions`, TransactionRouter);
app.use(`${prefix}/notifications`, NotificationRouter);
app.use(`${prefix}/categories`, CategoryRouter);
app.use(`${prefix}/budgets`, BudgetRouter);
app.use(`${prefix}/reports`, reportRoutes);

module.exports = app;
