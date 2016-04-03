var express = require('express');
var router = express.Router();
var restrict = require('../config/restrict');
var userService = require('../services/user-service');

/* GET veiculos/ */
router.get('/', restrict, function (req, res) {
    
    var vm = {
        title: 'Veículos',
        user: req.user,
        veiculos: req.user.veiculos,
        defaultVeiculo: req.user.veiculos[0]
    }
    res.render('veiculos/index', vm);
});

router.get('/create', restrict, function (req, res) {
    var vm = {
        title: 'Veículos',
        nome: req.user ? req.user.nome : null, // se autenticou, exibir primeiro nome, senão, null
        user: req.user,
        veiculos: req.user.veiculos
    }
    res.render('veiculos/create', vm);
});

router.post('/create', function (req, res) {
    //se algo estiver errado, então crie um usuário
    //var algoErrado = false;
    //if (algoErrado) {
    var veiculo = req.body;
    veiculo.status = null;

    userService.updateUserAddVeiculo(req.user.email, veiculo, function (err) {
        if (err) {
            var vm = {
                title: 'Novo Veículo',
                input: req.body,
                error: err
            };
            return res.render('veiculos/create', vm);
        }
        res.redirect('/veiculos');
    });
});

router.get('/:id', function (req, res) {
    
    var placa = req.params.id;
    
    userService.userFindVeiculo(req.user.email, placa, function (result) {
        if (result) {
            var veiculo = {
                placa: result.placa,
                cor: result.cor,
                marca: result.marca,
                dispositivo: result.dispositivo
            }
            
            var vm = {
                title: 'Veículos',
                user: req.user,
                veiculos: req.user.veiculos,
                defaultVeiculo: veiculo
            }
            return res.render('veiculos/index', vm);
        }
        res.redirect('/veiculos');
    })
});

router.get('/excluir/:id', function (req, res) {
    
    var i = req.params.id;
    
    userService.updateUserRemoveVeiculo(req.user.email, i, function (err) {
        res.redirect('/veiculos');
    });
});

router.get('/aciona/:id', function (req, res) {
    
    var id = req.params.id;
    
    var numeroSerie = id.substring(id.indexOf("-") + 1, id.indexOf("_"));
    var status = id.substring(id.indexOf("_") + 1);
    
    var dispositivo = {
        numeroSerie: numeroSerie,
        status: status
    }
    
    userService.uptadeUserAcionaDispositivo(req.user.email, dispositivo, function (err) {
        if (!err) {
            res.redirect('/veiculos');
        }
    });
});

module.exports = router;