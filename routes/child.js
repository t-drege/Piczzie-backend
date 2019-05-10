const express = require('express');
const child_controller = require('../controllers/childController');
const router = express.Router();

/* POST new child */
router.post('/', child_controller.createChild);

/* GET LIST CHILDREN */
router.get('/children/:id', child_controller.getChildren);

/* UPDATE CHILD */
router.put('/:id', child_controller.updateChild);

router.delete('/:id', child_controller.removeChild);

module.exports = router;