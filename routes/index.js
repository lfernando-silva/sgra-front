var userService = require('../services/user-service');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    if (req.user) {
        return res.redirect('/veiculos');
    }
    var vm = {
        title: 'Login',
        error: req.flash('error')
    }
    res.render('index', vm);
});

module.exports = router;