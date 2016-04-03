var fs = require('fs');
var path = require('path');

var EnvConfigs = {};
var path = path.join(__dirname) + '/configs/';

if (fs.existsSync(path + 'ProdConfig.json')) {
    EnvConfigs = require("./configs/ProdConfig.json");
} else {
    EnvConfigs = require("./configs/DevConfig.json");
}

module.exports = EnvConfigs;