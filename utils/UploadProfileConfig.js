let multer = require('multer');
let crypto = require('crypto');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/' + req.user.user._id + "/gift/")
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + file.originalname.split('.')[1]);
        });
    }
});

let upload = multer({storage: storage});

module.exports = upload;