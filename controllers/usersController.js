const User = require('../models/usersModel');
const jsonwebtoken = require('jsonwebtoken');
const blacklist = require('express-jwt-blacklist');
const mongoose = require('mongoose');
const config = require('../config');

exports.user = function (req, res) {
    User.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, function (err, user) {
        if (err) {
            res.status(500);
            throw err
        }
        res.status(200).send(user)
    }).select({
        firstname: true,
        lastname: true,
        gender: true,
        email: true,
        password: true,
        birthday: true,
        photo: true,
        friends: true
    });
};

exports.updatePhoto = function (req, res) {
    User.updateOne(
        {"_id": mongoose.Types.ObjectId(req.params.id)}, // Filter
        {"photo": req.body.path} // Update
    )
        .then((obj) => {
            console.log(obj);
            res.send(obj).status(200)
        })
        .catch((err) => {
            console.log(err);
            res.status(500)
        })
};

exports.users_list = function (req, res) {
    if (req.query.user !== "") {
        var regex = new RegExp(req.query.user, 'i');
        User.find({
            $or: [
                {firstname: {$regex: regex}},
                {lastname: {$regex: regex}}],
        })
            .limit(10)
            .exec(function (err, docs) {
                res.send(docs)
            });
    } else {
        res.send([])
    }
};



exports.revokeToken = function (req, res) {
    console.log(req.body);
    let decode = jsonwebtoken.decode(req.body.token);
    blacklist.revoke(decode);
    return res.status(200).send("ok");
};


exports.getFriends = function (req, res) {
    User.aggregate([
        {$match: {_id: mongoose.Types.ObjectId(req.params.id)}},
        {
            $project: {
                friends: {
                    $filter: {
                        input: '$friends',
                        as: 'friend',
                        cond: {
                            $eq:
                                ['$$friend.state', 3]
                        }
                    }
                },
                _id: 0,
            },
        },
        {
            $lookup: {
                from: User.collection.name,
                localField: "friends.friends_id",
                foreignField: "_id",
                as: "friends"
            }
        }
    ], function (err, list) {
        if (err) {
            res.status(500);
            throw err;
        } else {
            res.status(200).send(list[0].friends)
        }
    })
};

exports.deleteFriend = function (req, res) {
    User.updateOne({
            _id: req.user.user._id
        },
        {
            $pull:
                {
                    "friends":
                        {
                            friends_id: req.params.id
                        }
                }
        }, function (err, user) {
            if (err) {
                res.status(500);
            } else {
                res.status(200).send(user)
            }
        });
};


exports.updateRelationship = async function (req, res) {

    let user_id = req.body.user_id;
    let friends_id = req.body.friends_id;
    let state = req.body.state;
    let state2 = 2;
    let friends = [];

    if (state == 1) {
        friends = [addFriend(user_id, friends_id, state),
            addFriend(friends_id, user_id, state2)
        ];
    } else if (state == 3) {
        friends = [updateFriends(user_id, friends_id, state),
            updateFriends(friends_id, user_id, state)
        ];
    } else {
        friends = [removeFriend(user_id, friends_id, state),
            removeFriend(friends_id, user_id, state)
        ];
    }

    let promise = friends.map((friend) => {
        return friend
    });

    await Promise.all(promise
    ).then((doc) => {
        res.status(200).send(doc)
    }).catch((err) => {
        res.status(500).send(err);
    });
};

function updateFriends(user_id, friends_id, state) {
    return User.updateOne({
        "_id": mongoose.Types.ObjectId(user_id),
        "friends.friends_id": mongoose.Types.ObjectId(friends_id)
    }, {
        "$set": {
            "friends.$.state": state
        },
    });
}

function removeFriend(user_id, friend_id) {
    return User.updateOne({
            _id: user_id
        },
        {
            $pull:
                {
                    "friends":
                        {
                            friends_id: friend_id
                        }
                }
        });
}

function addFriend(user_id, friend_id, state) {
    return User.findOneAndUpdate({
            _id: user_id
        },
        {
            $push:
                {
                    "friends":
                        {
                            friends_id: friend_id,
                            state: state
                        }
                }
        });
}

