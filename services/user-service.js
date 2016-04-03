var bcrypt = require('bcryptjs');
var User = require('../models/user');

var userService = {
    addUser: function (user, next) {
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {
                return next(err);
            }
            var newUser = new User({
                nome: user.nome,
                cpf: user.cpf,
                email: user.email.toLowerCase(),//para garantir que todo email sempre estará minúsculo ao salvar
                password: hash, //senha criptografada
                veiculos: []
            });
            
            newUser.save(function (err) {
                if (err) {
                    return next(err);
                }
                next(null);
            });
        });
    },
    
    findUser: function (email, next) {
        User.findOne({ email: email }, function (err, user) {
            next(err, user);
        });
    },
    
    findUserDispositivo : function (dispositivo, next) {
        User.findOne({ "veiculos.dispositivo.numeroSerie": dispositivo }, function (err, user) {
            if (err || !user) {
                next(err);
            }
            next(err, user);
        });
    },
    
    validaVeiculo : function (email, veiculo, next) {
        //procurar por um usuario que tenha
        //'veiculos.dispositivo.numeroSerie '= veiculo.numeroSerie
        //ou
        //veiculos.placa = veiculo.placa E  email: email
        User.findOne(
            {
                $or: [
                    { 'veiculos.dispositivo.numeroSerie': veiculo.numeroSerie },
                    { $and: [{ email: email }, { 'veiculos.placa': veiculo.placa }] }
                ]
            }, 
        function (err, user) {
                next(err, user);
            });
    },
    
    updateUser : function (user, next) {
        bcrypt.hash(user.password, 10, function (err, hash) {
            User.update({ email: user.email }, {
                $set: {
                    nome: user.nome,
                    cpf: user.cpf,
                    email: user.email.toLowerCase(),
                    password: hash
                }
            }, function (err) {
                if (err) return next(err);
                next(err, user);
            });
        });
    },
    
    userFindVeiculo: function (email, placa, next) {
        User.find({ email: email, "veiculos.placa": placa }, { "veiculos.$": 1 }, function (err, result) {
            if (err || !result || result.length == 0) {
                return next('Not Found');
            };
            next(result[0].veiculos[0]);
        })
    },
    
    updateUserAddVeiculo : function (email, veiculo, next) {
        
        var dateTime = userService.getDateTime();
        
        var ativacoes = [];
        var ativacao = {
            status: veiculo.status,
            horario: dateTime.horario,
            data: dateTime.data
        }
        
        ativacoes.push(ativacao);
        
        userService.validaVeiculo(email, veiculo, function (err, user) {
            if (err) {
                return next(err);
            }
            
            User.update({ email: email }, {
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
            }, function (user) {
                next(user);
            });
            
        });
    },
    
    updateUserRemoveVeiculo : function (email, placa, next) {
        
        var p = placa;
        
        User.update({ email: email }, {
            $pull: {
                veiculos: { placa: p }
            }
        }, function (err, user) {
            if (err) {
                console.log(err);
            }
            next(err, user);
        });
    },
    
    updateUserIsAberto: function (numeroSerie, isAberto, next) {
        User.update({ "veiculos.dispositivo.numeroSerie": numeroSerie }, 
            { $set: { "veiculos.$.dispositivo.isAberto": isAberto } }, function (err) {
            if (err) {
                return next(err);
            }
            return next();
        });
    },
    
    updateUserIsConectado: function (numeroSerie, isConectado, next) {
        User.update({ "veiculos.dispositivo.numeroSerie": numeroSerie }, 
            { $set: { "veiculos.$.dispositivo.isConectado": isConectado } }, function (err) {
            if (err) {
                return next(err);
            }
            return next();
        });
    },
    
    uptadeUserAcionaDispositivo : function (email, dispositivo, next) {
        
        var dateTime = userService.getDateTime();
        var status = userService.checkNextState(dispositivo.status);
        
        var ativacao = {
            status: status,
            horario: dateTime.horario,
            data: dateTime.data
        }
        
        User.update({ 'veiculos.dispositivo.numeroSerie': dispositivo.numeroSerie }, {
            $push: {
                'veiculos.$.dispositivo.ativacoes': { $each: [ativacao], $position: 0 }
            }
        }, function (err, user) {
            if (err) {
                console.log(err);
            }
            next(err, user);
        });
    },
    
    deleteUser : function (email, next) {
        User.remove({ email: email }, function (err) {
            if (err) {
                return next();
            }
            next(null);
        })

    },
    
    getDateTime: function () {
        var now = new Date();
        var hora = now.getHours();
        var minutos = now.getMinutes();
        var dia = now.getDate();
        var mes = now.getUTCMonth() + 1;
        var ano = now.getFullYear();
        
        var stringDateTime = {
            horario: hora + ":" + minutos,
            data: dia + "/" + mes + "/" + ano
        }
        return stringDateTime;
    },
    
    checkNextState: function (status) {
        if (status == '1') {
            return null;
        } else {
            return '1';
        }
    }
}

module.exports = userService;