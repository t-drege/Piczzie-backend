let User = require('../models/usersModel');

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
        if (token == null) {
            res.status(403);
        } else {
            let array = {token: token, refresh_token: refreshToken};
            res.json(array);
        }
    })
};
