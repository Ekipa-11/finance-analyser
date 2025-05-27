const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController.js");

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

module.exports = router;
