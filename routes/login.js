var express= require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED= require('../config/config').SEED;


var app= express();

var Usuario= require('../models/usuario');

//Google
var CLIENT_ID= require('../config/config').CLIENT_ID;
const { OAuth2Client } = require ( 'google-auth-library' );    
const client= new OAuth2Client ( CLIENT_ID ); 

//=====================================================
// LOGIN CON GOOGLE
//=====================================================
    // verificar integridad del token
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        es_usuario_google: true
    }
  }

app.post('/google', async (req, res)=>{

    var token= req.body.token;

    var googleUser= await verify(token)
        .catch(e =>{
            return res.status(403).json({
                ok: false,
                mensaje: 'token no valido',
            });
        })

    //verificar si el correo se auntentico con el correo
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false, 
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if(usuarioDB){
            if(!usuarioDB.google === false){
                return res.status(400).json({
                    ok: false, 
                    mensaje: 'Debe de usar su autenticacion normal'
                 
                });

            }else{
                var token= jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}) //4horas= 14400

                res.status(200).json({
                    ok: true,
                    Usuario: usuarioDB,
                    token:token,
                    id: usuarioDB._id
                });
            }
            }else{
                //el usuario no existe.... hay que autenticarlo
                var usuario = new Usuario();
                
                usuario.nombre= googleUser.nombre;
                usuario.email= googleUser.email;
                usuario.img= googleUser.img;
                usuario.es_usuario_google= true;
                usuario.password= ':-)';

                usuario.save((err, usuarioDB)=>{
                    var token= jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}) //4horas= 14400

                    res.status(200).json({
                        ok: true,
                        Usuario: usuarioDB,
                        token:token,
                        id: usuarioDB.id
                    });
                });
        }
    });
});

//=====================================================
// LOGIN NORMAL
//=====================================================

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
        //comparar contrasena encriptada
        if(bcrypt.compareSync(JSON.stringify(body.password), usuarioDB.password)){ // ====> problema con bcrypt
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