const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController.js");
const exportController = require("../controllers/exportController.js");

/*
 * POST
  Login user
 */
router.post("/login", UserController.login);

/*
 * POST
  Register user
 */
router.post("/register", UserController.register);

/*
 * GET
  Report
 */

router.get("/report", exportController.getUserReport);

/*
 * GET
  Csv of transactions
 */

router.get("/export", exportController.getTransactionsCsv);

module.exports = router;
