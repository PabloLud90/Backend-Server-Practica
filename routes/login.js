var express= require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED= require('../config/config').SEED;

var app= express();

var Usuario= require('../models/usuario');

app.post('/', (req, res)=>{
    var body= req.body

    //ver si existe un usuari con ese correo
    Usuario.findOne({email: body.email}, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false, 
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false, 
                mensaje: 'credenciales incorrectas - email',
                errors: err
            });
        }
        if(bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false, 
                mensaje: 'credenciales incorrectas - password',
                errors: err
            });

        }
        //crear tokens
        usuarioDB.password= ':)';
        var token= jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}) //4horas= 14400

        res.status(200).json({
            ok: true,
            Usuario: usuarioDB,
            token:token,
            id: usuarioDB._id
        });

    });


})


module.exports= app;