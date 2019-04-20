let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let childSchema = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    gender: {type: Number, required: true},
    birthday: {type: Date, required: true},
    parent: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

let Child = mongoose.model('Child', childSchema);

module.exports = Child;