var EnvConfigs = require('./EnvConfigs.js');
var config = {
    mongoUri: EnvConfigs.mongoUri,
    cookieMaxAge: 30 * 24 * 3600 * 1000 //1 mês em milissegundos
};

module.exports = config;