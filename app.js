//PACKAGE
let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let expressJwt = require('express-jwt');
let blacklist = require('express-jwt-blacklist');
let cors = require('cors');

//CONFIG
var config = require('./config');

//ROUTING
const userRouter = require('./routes/users');
const giftRouter = require('./routes/gift');
const childRouter = require('./routes/child');

const authenticationRouter = require('./routes/authentication');

//Ex framework
let app = express();

let corsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200
};

//CORS CONFIG
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//Routing initialize
app.use('/', authenticationRouter);
app.use(express.static(__dirname));
app.use('/', express.static(__dirname +'/uploads/*'));
app.use('/api/*', expressJwt({secret: config.TOKEN_SECRET, isRevoked: blacklist.isRevoked }));
app.use('/api/user', userRouter);
app.use('/api/gift', giftRouter);
app.use('/api/child', childRouter);


app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.send(401, 'invalid token...');
    }
});

let port = process.env.PORT || 8080;
app.listen(port);

mongoose.connect(config.MONGO_URI, {useNewUrlParser: true}, function (err) {
    if (err) {
        throw err;
    }
});

module.exports = app;