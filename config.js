module.exports = {
    // 1. MongoDB
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/piczzie',

    // 2. JWT
    TOKEN_SECRET: 'eRV7lJx8hDwf5rfE4O1WLaCb2Lne6aUs',

    // 3. Express Server Port
    LISTEN_PORT: process.env.LISTEN_PORT || 3000

};