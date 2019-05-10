const mongoose = require('mongoose');
const Child = require('../models/childModel');

exports.createChild = function (req, res) {

    let child = new Child(req.body);
    child.parent = mongoose.Types.ObjectId(req.user.user._id);

    child.save(function (err) {
        if (err) throw err;
        child.populate({
            path: 'parent'
        }, function (err, doc) {
            res.status(200).send(doc);
        });
    });
};

exports.getChildren = function (req, res) {
    Child.find({parent: req.params.id}, {parent: false}, function (err, children) {
        if (err) {
            res.status(500);
            throw err
        }
        res.status(200).send(children)
    })
};


exports.updateChild = function (req, res) {
    Child.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {
        new: true,
        upsert: false,
        remove: {},
        fields: {}
    }, function (err, child) {
        if (err) {
            throw err
            res.status(500).send(err);
        } else {
            res.status(200).send(child)
        }
    }).populate({path: 'parent'})
};


exports.removeChild = function (req, res) {
    Child.findOne({_id: req.params.id}, function (err, child) {
        child.remove(function (err) {
            if (err) {
                res.status(500);
                throw err;
            } else {
                res.status(200).send(child)
            }
        });
    })
};


