const User = require('../models/usersModel');
const jsonwebtoken = require('jsonwebtoken');
const blacklist = require('express-jwt-blacklist');
const config = require('../config');

exports.registration = function (req, res) {
    let user = new User(req.body);
    user.save(function (err) {
        if (err) throw err;
        res.json(user)
    });
};

exports.authentication = function (req, res) {
    let user = new User(req.body);
    User.getAuthenticated(user, function (null_response, token, refreshToken, doc) {
        console.log(token);
        if (token == null) {
            res.status(403).send("error auth");
        } else {
            let array = {token: token,
                refresh_token: refreshToken,
                _id: doc._id,
                email: doc.email,
                firstname: doc.firstname,
                lastname: doc.lastname,
                photo: doc.photo
            };
            res.status(200).send(array);
        }
    })
};

exports.refreshToken = function (req, res) {
    console.log(req.body);
    jsonwebtoken.verify(req.body.token, config.TOKEN_SECRET, function (callback) {
        console.log("test");
        if (callback != null) {
            console.log("fsqfqsfsqfds")
            res.json(401);
        } else {
            let decode = jsonwebtoken.decode(req.body.token);
            User.findOne({_id: decode.user._id}, function (err, user) {
                let payload = {sub: user._id, user: user};
                let token = jsonwebtoken.sign(payload, config.TOKEN_SECRET, {expiresIn: '1d'});
                let refreshToken = jsonwebtoken.sign(payload, config.TOKEN_SECRET, {expiresIn: '7d'});
                let array = {token: token, refresh_token: refreshToken};

                //blacklist.revoke(decode);
                console.log(array);
                res.status(200).send(array);
            });
        }
    });
};