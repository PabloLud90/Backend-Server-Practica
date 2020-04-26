var express= require('express');
var app= express();

//importar modelo para asiganr la imagen
var Usuario= require('../models/usuario');
var Hospital= require('../models/hospital');
var Medico= require('../models/medico');

var fs= require ('fs');

const fileUpload = require('express-fileupload'); //libreria para subir imagenes
// default options
app.use(fileUpload()); //inicializacion de la variable

app.put('/:tipo/:id', (req, res, next )=> {
    var tipo= req.params.tipo;
    var id= req.params.id;

    //Tipos de coleccion
    var tiposColeccionValidos= ['hospitales', 'medicos', 'usuarios'];
    if(tiposColeccionValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok:false,
            mensaje: 'Tipo de coleccion no valido',
            errors: {menssage: 'Las colleciones validas son: '}
        })

    }

    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: ' no seleccioono imagen',
            errors: {message: 'Seleccione una imagen'}
        });
    }

    //obtener nombre archivo
    var archivo= req.files.imagen; // selcciona la imagen
    var nombreCortado= archivo.name.split('.'); // toma la ultima parte del nombre separada del punto maria.jpeg
    var extensionArchivo= nombreCortado[nombreCortado.length -1]; //obtiene la extension de la imagen


    //extensiones validas
    var extensionesValidas=['jpeg', 'png', 'gif'];
    if(extensionesValidas.indexOf(extensionArchivo) < 0){
        res.status(400).json({
            ok: true, 
            mensaje: 'Extension de la imagen no valida',
            errors: {menssage: 'La sextensiones deben ser: '+ extensionesValidas.join(', ')} //indica al usuario las extensiones validas
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo= `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`; // asigna un nuevo nombre a la imagen que se esta subiendo


    //Mover el archivo del temporal a un path
    var path= `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err=>{
        if(err){
            res.status(400).json({
                ok: true, 
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subir(tipo, id, nombreArchivo, res);
    });
});

function subir(tipo, id, nombreArchivo, res){
    if(tipo == 'usuarios'){
        Usuario.findById(id, (err, usuario)=>{

            if(!usuario){
                return res.status(400).json({
                    ok: true, 
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }

            var pathAnterior= './uploads/usuarios/' + usuario.img;

            if(fs.existsSync(pathAnterior)){   //esta validadcion es para eliminar la imagen anterior
                fs.unlink(pathAnterior);
            }

            usuario.img= nombreArchivo;
            usuario.save((err, usuarioActualizado)=>{

                usuarioActualizado.password= ':-)';

               return res.status(200).json({
                    ok: true, 
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            })
        })
    }

    if(tipo == 'medicos'){
        Medico.findById(id, (err, medico)=>{

            if(!medico){

                return res.status(400).json({
                    ok: true, 
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                });

            }

            var pathAnterior= './uploads/medicos/' + medico.img;

            if (fs.existsSync(pathAnterior)){
                fs.unlink(pathAnterior);
            }

            medico.img= nombreArchivo;
            medico.save((err, medicoActualizado)=>{
                return res.status(200).json({
                    ok: true, 
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });

    }

    if(tipo== 'hospitales'){
        Hospital.findById(id, (err, hospital)=>{
            //validacion para cuando no exista
            if(!hospital){

                return res.status(400).json({
                    ok: true, 
                    mensaje: 'hospital no existe',
                    errors: {message: 'hospital no existe'}
                });

            }
            var pathAnterior= './uploads/hospitales/' + hospital.img;

            if(fs.existsSync(pathAnterior)){
                fs.unlink(pathAnterior);
            }


            hospital.img= nombreArchivo;
            hospital.save((err, hospitalActualizado)=>{
                return res.status(200).json({
                    ok: true, 
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });

        });

    }
    

}

module.exports= app;