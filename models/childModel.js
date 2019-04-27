const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Gift = require('../models/giftModel');

let childSchema = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    gender: {type: Number, required: true},
    birthday: {type: Date, required: true},
    parent: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});


childSchema.pre('remove', function (doc, next) {
    console.log(doc);
    Gift.updateMany({child: doc.id}, {$unset: {child: 1}}, function (err, gift) {
        if (err) {
            throw err;
        } else {
            next()
        }
    })
});

let Child = mongoose.model('Child', childSchema);


module.exports = Child;