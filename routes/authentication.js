let express = require('express');
let auth_controller = require('../controllers/authenticationController');
let router = express.Router();

router.post('/registration', auth_controller.registration);

router.post('/login', auth_controller.authentication);

// Create new token
router.post('/token', auth_controller.refreshToken);

module.exports = router;

