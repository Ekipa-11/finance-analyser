var express = require("express");
var router = express.Router();
var UserController = require("../controllers/UserController.js");

/*
 * GET
 */
router.get("/", UserController.list);

/*
 * GET
 * me
 */
router.get("/me", UserController.me);

/*
 * GET
 */
router.get("/:id", UserController.show);

/*
 * GET
 * Get user with all related data
 * (transactions, budgets)
 */
router.get("/:id/all", UserController.show_with_all);

/*
 * PUT
 */
router.put("/:id", UserController.update);

/*
 * DELETE
 */
router.delete("/:id", UserController.remove);

module.exports = router;
