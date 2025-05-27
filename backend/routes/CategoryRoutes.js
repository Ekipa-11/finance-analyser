var express = require('express');
var router = express.Router();
var CategoryController = require('../controllers/CategoryController.js');

/*
 * GET
 */
router.get('/', CategoryController.list);

/*
 * GET
 */
router.get('/:id', CategoryController.show);

/*
 * POST
 */
router.post('/', CategoryController.create);

/*
 * PUT
 */
router.put('/:id', CategoryController.update);

/*
 * DELETE
 */
router.delete('/:id', CategoryController.remove);

module.exports = router;
