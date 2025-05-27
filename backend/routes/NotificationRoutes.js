var express = require('express');
var router = express.Router();
var NotificationController = require('../controllers/NotificationController.js');

/*
 * GET
 */
router.get('/', NotificationController.list);

/*
 * GET
 */
router.get('/:id', NotificationController.show);

/*
 * POST
 */
router.post('/', NotificationController.create);

/*
 * PUT
 */
router.put('/:id', NotificationController.update);

/*
 * PUT
 * read notification
 */

router.put('/:id/read', NotificationController.update_read);

/*
 * PUT
 * unread notification
 */
router.put('/:id/unread', NotificationController.update_unread);

/*
 * DELETE
 */
router.delete('/:id', NotificationController.remove);

module.exports = router;
