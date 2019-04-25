const express = require('express');
const upload =require('../utils/UploadConfig');
const gift_controller = require('../controllers/giftController');
const router = express.Router();

/* POST gift */
router.post('/create', upload.single('image'), gift_controller.create);

router.get('/friends', gift_controller.getGiftsFriends);

router.get('/friends/update', gift_controller.getYoungerGiftsFriends);

router.get('/user',gift_controller.getGiftsUser);

router.get('/user/reservation',gift_controller.getGiftReservation);

router.put('/update/:id', gift_controller.update);

router.put('/update/:id/user', gift_controller.updateGiftUser);

router.delete('/delete/:id', gift_controller.deleteGift);

router.get('/child/:id', gift_controller.getGiftChildren);

module.exports = router;
