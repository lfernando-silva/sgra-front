const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    if (req.user) {
        return res.redirect('/veiculos');
    }
    const vm = {
        title: 'Login',
        error: req.flash('error')
    }
    return res.render('index', vm);
});

module.exports = router;