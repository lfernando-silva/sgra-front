var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    nome: { type: String, required: "Insira seu primeiro nome" },
    cpf: {type:String, required: "Insira seu CPF" },
    email: {type:String, required: "Insira seu email" },
    password: { type: String, required: "Insira a senha" },
    veiculos: {type: Array, default: []},
    created: {type: Date, default: Date.now}
});

function find(value, callback) {
    var userService = require("../services/user-service");
    userService.findUser(value, function (err, user) {
        return err? callback(false) : callback(!user);
    });
}

//validar email, chamada a função definida no user-service.js
userSchema.path('email').validate(find, "Email já existente!");
var User = mongoose.model("User", userSchema);

module.exports = User;