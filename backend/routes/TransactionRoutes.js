var express = require('express');
var router = express.Router();
var TransactionController = require('../controllers/TransactionController.js');

/*
 * GET
 */
router.get('/', TransactionController.list);

/*
 * GET
 */
router.get('/:id', TransactionController.show);

/*
 * POST
 */
router.post('/', TransactionController.create);

/*
 * PUT
 */
router.put('/:id', TransactionController.update);

/*
 * DELETE
 */
router.delete('/:id', TransactionController.remove);

module.exports = router;
