let express = require('express');
let users_controller = require('../controllers/usersController');
let router = express.Router();

/* GET users listing. */
router.get('/users', users_controller.users_list);

/* GET one user listing. */
router.get('/:id', users_controller.user);

// Create new token
router.post('/token', users_controller.refreshToken);

//GET friends
router.get('/friends/:id', users_controller.getFriends);

// Revoke user token
router.post('/revoke', users_controller.revokeToken);

//DELETE friends
router.delete('/friends/:id', users_controller.deleteFriend);

router.put('/update/friends', users_controller.updateRelationship);

module.exports = router;