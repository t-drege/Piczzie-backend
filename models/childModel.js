const mongoose = require('mongoose');
const Gift = require('../models/giftModel');


let Schema = mongoose.Schema;


let childSchema = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    gender: {type: Number, required: true},
    birthday: {type: Date, required: true},
    parent: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});


childSchema.pre('remove', function (next) {
    let user = this;
    Gift.updateMany({child: user.id}, {$unset: {child: 1}}, function (err, gift) {
        console.log(err);
        if (err) {
            throw err;
        } else {
            next()
        }
    })
});

let Child = mongoose.model('Child', childSchema);


module.exports = Child;