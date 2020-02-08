const mongoose = require('mongoose');
const Gift = require('../models/giftModel');
const User = require('../models/usersModel');
const fs = require('fs');

exports.create = function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });
    } else {
        let gift = new Gift(JSON.parse(req.body.gift));
        gift.user_id = req.user.user._id;
        gift.image = req.file.path;
        gift.save(function (err) {
            return res.send({
                success: true
            }).status(200);
        });
    }
};

exports.getGiftsFriends = function (req, res) {
    User.aggregate([
        {$match: {_id: mongoose.Types.ObjectId(req.user.user._id)}},
        {
            $project: {
                friends: {
                    $filter: {
                        input: '$friends',
                        as: 'friend',
                        cond: {$eq: ['$$friend.state', 2]}
                    }
                },
                _id: 0,
            },
        },
        {
            $project: {
                'friends._id': false,
                'friends.state': false,
            },
        },
    ]).then(users => {

        var objectIds = users[0].friends.map(function (item) {
            return mongoose.Types.ObjectId(item.friends_id);
        });

        Gift.find({user_id: {$in: objectIds}}, function (err, gifts) {
            if (err) {
                console.log(err)
            }
            var giftArray = gifts.map(function (item) {
                item.set('user_request', req.user.user._id, {strict: false});
                return item
            });
            res.json(giftArray);
        }).populate({path: 'user_id user_reserved_id', select: {password: 0, friends: 0}})
            .sort({date: -1})
            .skip(Number(req.query.offset))
            .limit(5)
    })
};

exports.getYoungerGiftsFriends = function (req, res) {
    User.aggregate([
        {$match: {_id: mongoose.Types.ObjectId(req.user.user._id)}},
        {
            $project: {
                friends: {
                    $filter: {
                        input: '$friends',
                        as: 'friend',
                        cond: {$eq: ['$$friend.state', 1]}
                    }
                },
                _id: 0,
            },
        },
        {
            $project: {
                'friends._id': false,
                'friends.state': false,
            },
        },
    ]).then(users => {

        var objectIds = users[0].friends.map(function (item) {
            return mongoose.Types.ObjectId(item.friends_id);
        });

        var date = new Date(req.query.date);

        date.setHours(date.getHours() + 1);

        Gift.find({
            user_id: {$in: objectIds},
            date: {$gte: date}
        }, function (err, gifts) {
            if (err) {
                console.log(err)
            }
            var giftArray = gifts.map(function (item) {
                item.set('user_request', req.user.user._id, {strict: false});
                return item
            });

            giftArray.splice(0, 1);

            res.json(giftArray);

        }).populate({path: 'user_id user_reserved_id', select: {password: 0, friends: 0}}).sort({date: 1})
    })
};


exports.update = function (req, res) {
    Gift.findOne({_id: req.params.id}, function (err, gift) {
        if (err) return res.status(500).send(err);

        if (gift.user_reserved_id === undefined) {

            gift.user_reserved_id = req.user.user._id;

        } else if (gift.user_reserved_id == req.user.user._id) {
            gift.user_reserved_id = undefined;

        } else {
            return res.status(200).send(gift);
        }

        gift.save(function (err, gift) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            gift.populate('user_id', 'user_reserved_id').populate({
                path: 'user_id user_reserved_id'
            }, function (err, gift) {
                gift.set('user_request', req.user.user._id, {strict: false});
                return res.send(gift);
            });
        })
    })
};

exports.updateGiftUser = function (req, res) {
    Gift.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {
        new: true,
        upsert: false,
        remove: {},
        fields: {}
    }, function (err, gift) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        gift.populate('user_id', 'user_reserved_id').populate({
            path: 'user_id user_reserved_id'
        }, function (err, gift) {
            gift.set('user_request', req.user.user._id, {strict: false});
            return res.send(gift);
        });
    })
};


exports.getGiftsUser = function (req, res) {
    Gift.find({user_id: mongoose.Types.ObjectId(req.params.id)}, {
        user_id: false,
        user_reserved_id: false
    }, function (err, gifts) {
        if (err) {
            res.status(500).send(err);
            throw err;
        }
        res.status(200).send(gifts)
    }).skip(Number(req.query.offset)).limit(10)
};


exports.getGiftReservation = function (req, res) {
    Gift.find({user_reserved_id: mongoose.Types.ObjectId(req.user.user._id)}, {
        user_reserved_id: false
    }, function (err, gifts) {
        if (err) {
            res.status(500).send(err);
            throw err;
        }
        res.status(200).send(gifts)
    }).populate({path:'user_id'}).skip(Number(req.query.offset)).limit(20).sort({date_reservation: -1})
};

exports.deleteGift = function (req, res) {
    Gift.findOne({_id: req.params.id}, function (err, gift) {
        fs.unlink(gift.image, function (err) {
            if (err) {
                res.status(500).send(err);
                console.log(err)
            } else {
                Gift.deleteOne({_id: req.params.id}, function (err, gift) {
                    if (err) {
                        res.status(500).send(err);
                        throw err;
                    } else {
                        res.status(200).send("ok");
                    }
                })
            }
        });
    })
};

exports.getGiftChildren = function (req, res) {
    Gift.find({child: req.params.id}, function (err, gifts) {
        if(err){
            res.status(500)
        }else {
            res.status(200).send(gifts)
        }
    }).populate({path: "user_id child user_reserved_id"})
};




