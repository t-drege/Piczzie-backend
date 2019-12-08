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
        friends:
            {
                $elemMatch:
                    {
                        state: 2
                    }
            },
    });
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

exports.refreshToken = function (req, res) {
    jsonwebtoken.verify(req.body.token, config.TOKEN_SECRET, function (callback) {
        if (callback != null) {
            res.json(401);
        } else {
            let decode = jsonwebtoken.decode(req.body.token);
            User.findOne({_id: decode.user._id}, function (err, user) {
                let payload = {sub: user._id, user: user};
                let token = jsonwebtoken.sign(payload, config.TOKEN_SECRET, {expiresIn: '1d'});
                let refreshToken = jsonwebtoken.sign(payload, config.TOKEN_SECRET, {expiresIn: '7d'});
                let array = {token: token, refresh_token: refreshToken};

                blacklist.revoke(decode);

                res.json(array);
            });
        }
    });
};

exports.revokeToken = function (req, res) {
    let decode = jsonwebtoken.decode(req.body.token);
    blacklist.revoke(decode);
    res.json(200)
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
                                ['$$friend.state', 2]
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
    console.log(req.body.state);
    let user_id = req.body.user_id;
    let friends_id = req.body.friends_id;
    let state = req.body.state;
    let state2 = 1;
    let friends = [];

    if (state == 0) {
        friends = [addFriend(user_id, friends_id, state),
            addFriend(friends_id, user_id, state2)
        ];
    } else if (state == 2) {
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
        console.log(doc);
        res.status(200).send(doc)
    }).catch((err) => {
        res.status(500).send(err);
    });
};

function updateFriends(user_id, friends_id, state) {
    return User.findOneAndUpdate({
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
    console.log(state);
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

