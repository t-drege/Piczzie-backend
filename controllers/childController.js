const mongoose = require('mongoose');
const Child = require('../models/childModel');

exports.createChild = function(req, res){

    let child = new Child(req.body);
    child.parent = mongoose.Types.ObjectId(req.user.user._id);

    child.save(function (err) {
        if (err) throw err;
        res.status(200).send(child)
    });
};

exports.getChildren = function (req, res) {
    Child.find({parent: req.user.user._id}, {parent: false}, function (err, children) {
        if (err) {
            res.status(500);
            throw err
        }
        res.status(200).send(children)
    })
};
