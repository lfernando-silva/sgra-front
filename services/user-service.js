var bcrypt = require('bcryptjs');
var async = require('async');
var User = require('../models/user');

var userService = {
    addUser: function (user, next) {
        
        var tasks = [
            async.apply(bcrypt.hash, user.password, 10),
            build,
            save
        ];
        async.waterfall(tasks, function (err, done) {
            return callback(err, done);
        });
    },
    
    findUser: function (email, callback) {
        User.findOne({ email: email }, function (err, user) {
            return callback(err, user);
        });
    },
    
    findUserDispositivo : function (dispositivo, callback) {
        User.findOne({ "veiculos.dispositivo.numeroSerie": dispositivo }, function (err, user) {
            return callback(err || !user? err: null , user);
        });
    },
    
    validaVeiculo : function (email, veiculo, callback) {
        //procurar por um usuario que tenha
        //'veiculos.dispositivo.numeroSerie '= veiculo.numeroSerie
        //ou
        //veiculos.placa = veiculo.placa E  email: email
        var params = {
            $or: [
                { 'veiculos.dispositivo.numeroSerie': veiculo.numeroSerie },
                { $and: [{ email: email }, { 'veiculos.placa': veiculo.placa }] }
            ]
        };
        
        User.findOne(params, function (err, user) {
            return callback(err, user);
        });
    },
    
    userFindVeiculo: function (email, placa, callback) {
        User.find({ email: email, "veiculos.placa": placa }, { "veiculos.$": 1 }, function (err, result) {
            return callback(err || !result || result.length == 0? 'Not Found': null, result[0].veiculos[0]);
        });
    },
    
    updateUser : function (user, callback) {
        var tasks = [
            async.apply(bcrypt.hash, user.password, 10),
            function (hash, callback) {
                var where = { email: user.email };
                var uset = {
                    $set: {
                        nome: user.nome,
                        cpf: user.cpf,
                        email: user.email.toLowerCase(),
                        password: hash
                    }
                }
                return update(where, uset, callback);
            }
        ];
        
        async.waterfall(tasks, function (err, done) {
            return callback(err, done);
        });
    },
    updateUserAddVeiculo : function (email, veiculo, callback) {
        var ativacoes = [];
        ativacoes.push(buildAtivacao(veiculo.status));
        var tasks = [
            async.apply(userService.validaVeiculo, email, veiculo),
            function (user, callback) {
                var where = { email: email };
                var uset = {
                    $addToSet: {
                        veiculos: {
                            placa: veiculo.placa,
                            marca: veiculo.marca,
                            cor: veiculo.cor,
                            dispositivo: {
                                numeroSerie: veiculo.numeroSerie,
                                isConectado: null,
                                isAberto: null, 
                                //aberto = null significa que o carro está aberto, = 1 está fechado. 
                                // Alarme só dispara quando: isAberto = null E status = 'ATIVADO'
                                ativacoes: ativacoes
                            }
                        }
                    }
                }
                return update(where, uset, callback);
            }
        ];
        async.waterfall(tasks, function (err, done) {
            return callback(done);
        });
    },
    updateUserRemoveVeiculo : function (email, placa, callback) {
        
        var p = placa;
        var where = { email: email };
        var uset = {
            $pull: {
                veiculos: { placa: p }
            }
        };
        return update(where, uset, callback);
    },  
    uptadeUserAcionaDispositivo : function (email, dispositivo, callback) {
        
        var ativacao = buildAtivacao(checkNextState(dispositivo.status))
        var where = { 'veiculos.dispositivo.numeroSerie': dispositivo.numeroSerie };
        var uset = {
            $push: {
                'veiculos.$.dispositivo.ativacoes': { $each: [ativacao], $position: 0 }
            }
        };
        return update(where, uset, callback);
    },
    deleteUser : function (email, callback) {
        var where = { email: email };
        User.remove(where, function (err) {
            return callback(err);
        });
    }
}

function build(hash, callback) {
    var newUser = new User({
        nome: user.nome,
        cpf: user.cpf,
        email: user.email.toLowerCase(),//para garantir que todo email sempre estará minúsculo ao salvar
        password: hash, //senha criptografada
        veiculos: []
    });
    return callback(null, newUser);
}

function save(newUser, callback) {
    newUser.save(function (err) {
        return callback(err);
    });
}

function update(where, uset, callback){
    User.update(where, uset, function (err, user) {
        return callback(err, user);
    });
}

function buildAtivacao(status) {
    var dateTime = getDateTime();
    return {
        status: status,
        horario: dateTime.horario,
        data: dateTime.data
    }
}

function getDateTime() {
    return {
        horario: now.toLocaleTimeString(),
        data: now.toLocaleDateString()
    }
}

function checkNextState(status) {
    return (status == '1')? null: '1';
}

module.exports = userService;