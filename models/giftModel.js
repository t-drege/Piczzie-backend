let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let giftSchema = new Schema({
    description: {type: String, required: true},
    price: {type: Number, required: false},
    place: {type: String, required: false},
    website: {type: String, required: false},
    date: {type: Date, required: true},
    image: {type: String, required: false},
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    user_reserved_id: {type: Schema.Types.ObjectId, ref: 'User'},
    date_reservation: {type: Date, default: Date.now, required: false},
    event: {type: Schema.Types.ObjectId, ref: 'Event'},
    child: {type: Schema.Types.ObjectId, ref: 'Child'}
});

let Gift = mongoose.model('Gift', giftSchema);

module.exports = Gift;
