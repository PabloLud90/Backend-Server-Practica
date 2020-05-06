var express= require('express');
var bcrypt = require('bcryptjs');
var jwt= require('jsonwebtoken');


var mdAutenticacion= require('../middlewares/autenticacion');

var app= express();

var Usuario= require('../models/usuario');



//=====================================================
// Obtener todos los usuarios
//=====================================================
app.get('/', (req, res, next )=> {

    var desde=  req.query.desde || 0;
    desde= Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios)=>{
            if(err){
                return res.status(500).json({
                    ok: false, 
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo)=>{

                res.status(200).json({
                    ok: true, 
                    usuarios: usuarios,
                    total: conteo
                });
            })

 
        })
})


//=====================================================
// Put(Actualizar) usuarios
//=====================================================
app.put('/:id', mdAutenticacion.verificaToken,(req, res)=>{
    var id= req.params.id;
    var body= req.body;

    Usuario.findById(id, (err, usuario)=>{
        if(err){
            return res.status(500).json({
                ok: false, 
                mensaje: 'Error Usuario no existe',
                errors: err
            });
        }
        if (!usuario){
            return res.status(400).json({
                ok: false, 
                mensaje: 'El Usuario con el id' + id + 'no existe',
                errors: {message: 'No existe usuario con ese ID'}
            });
        }

        usuario.nombre= body.nombre;
        usuario.email= body.email;
        usuario.role= body.role;

        usuario.save((err, usuarioGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false, 
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true, 
                usuario: usuarioGuardado,
                usuariotoken: req.usuario
            });
        });
    });
});

//=====================================================
// Crear usuarios
//=====================================================
app.post('/', (req,res)=>{
    var body= req.body;

    var usuario= new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(JSON.stringify(body.password), 10),
        //password: body.password,
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false, 
                mensaje: 'Error crear usuario',
                errors: err
            });
        }

        usuarioGuardado.password= ':)';

        res.status(201).json({
            ok: true, 
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});



//=====================================================
// Eliminar usuarios
//=====================================================
app.delete('/:id',mdAutenticacion.verificaToken,(req,res)=>{
    var id= req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
        if(err){
            return res.status(500).json({
                ok: false, 
                mensaje: 'Error al eliminar el usuario',
                errors: err
            });
        }
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false, 
                mensaje: 'No existe usuario con ese ID',
                errors: err
            });
        }
        res.status(200).json({
            ok: true, 
            usuario: usuarioBorrado
        });

    })
});


module.exports= app;