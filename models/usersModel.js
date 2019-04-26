let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let jsonwebtoken = require('jsonwebtoken');
let fs = require('fs');
let config = require('../config');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    gender: {type: Number, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    birthday: {type: Date, required: true},
    photo: {type: String, required: false},
    friends: [{
        friends_id: {type: Schema.Types.ObjectId, ref: 'User'},
        state: {type: Number, required: true}
    }]
});

// 4. Encypt and store the person's password
userSchema.pre('save', function (next) {
    let user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        console.log(salt);
        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            // override the clear-text password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.post('save', function (doc, next) {
    let user = this;
    // Creates /tmp/a/apple, regardless of whether `/tmp` and /tmp/a exist.
    fs.mkdir('./uploads/' + user.id + "/gift", {recursive: true}, (err) => {
        if (err) throw err;
    });

    fs.mkdir('./uploads/' + user.id + "/profil", {recursive: true}, (err) => {
        if (err) throw err;
        next()
    });
});


userSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return callback(err);
        return callback(null, isMatch);
    });
};

userSchema.statics.getAuthenticated = function (user, callback) {
    this.findOne({email: user.email}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        // make sure the user exists
        else if (!doc) {
            return callback(new Error('Invalid username or password.', 401), null);
        } else {
            // test for a matching password
            doc.comparePassword(user.password, function (err, isMatch) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                // check if the password was a match
                if (isMatch) {
                    // return the jwt
                    let payload = {'sub': doc._id, 'user': doc};
                    var token = jsonwebtoken.sign(payload, config.TOKEN_SECRET, {expiresIn: '1d'});
                    var tokenRefresh = jsonwebtoken.sign(payload, config.TOKEN_SECRET, {expiresIn: '7d'});
                    return callback(null, token, tokenRefresh, doc);
                } else {
                    return callback(new Error('Invalid username or password.'), null);
                }
            });
        }
    });
};

let User = mongoose.model('User', userSchema);

module.exports = User;

