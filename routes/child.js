const express = require('express');
const child_controller = require('../controllers/childController');
const router = express.Router();

/* GET LIST CHILDREN */
router.get('/children', child_controller.getChildren);

/* POST new child */
router.post('/', child_controller.createChild);

module.exports = router;