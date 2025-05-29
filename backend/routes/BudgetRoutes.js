var express = require("express");
var router = express.Router();
var BudgetController = require("../controllers/BudgetController.js");

/*
 * GET
 */
router.get("/", BudgetController.list);

/*
 * GET
 */
router.get("/:id", BudgetController.show);

/*
 * POST
 */
router.post("/", BudgetController.create);

/*
 * PUT
 */
router.put("/:id", BudgetController.update);

/*
 * DELETE
 */
router.delete("/:id", BudgetController.remove);

module.exports = router;
