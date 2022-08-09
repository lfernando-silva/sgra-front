module.exports = {
    meta: process.env.NODE_ENV,
    client: 'mongodb',
    mongoUri: process.env.MONGO_URI,
    cookieMaxAge: 30 * 24 * 3600 * 1000 //1 month
};