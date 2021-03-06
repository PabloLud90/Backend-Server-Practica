var express= require('express');
var mdAutenticacion= require('../middlewares/autenticacion');


var app= express();

var Hospital= require('../models/hospital');

//=====================================================
// Obtener todos los hospitales
//=====================================================
app.get('/', (req, res, next)=>{

    var desde=  req.query.desde || 0;
    desde= Number(desde);
    
    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err,hospitales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospital',
                errors: err
            });
        }
        Hospital.count({},(err, conteo)=>{
            res.status(200).json({
                ok:true,
                hospital: hospitales,
                total: conteo
            });

        });
  
    });
})

//=====================================================
// Actualizar hospital
//=====================================================
app.put('/:id', mdAutenticacion.verificaToken,(req, res)=>{
    var id= req.params.id;
    var body= req.body;

    Hospital.findById(id, (err, hospital)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar hospital, no existe',
                errors: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok:false,
                mensaje: 'El hospital con el id'+ id +'no existe',
                errors: {mensaje: 'No existe hospital con ese id'}
            });
        }

        hospital.nombre= body.nombre;
        hospital.usuario= req.usuario._id;

        hospital.save((err, hospitalGuardado)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
})

//=====================================================
// Crear un hospital
//=====================================================
app.post('/', mdAutenticacion.verificaToken,(req, res)=>{
    var body= req.body;

    var hospital= new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
})

//=====================================================
// Eliminar hospital
//=====================================================
app.delete('/:id', mdAutenticacion.verificaToken,(req,res)=>{
    var id= req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{
        if(err){
            return res.status(500).json({
                ok: false, 
                mensaje: 'Error al eliminar el hospital',
                errors: err
            });
        }
        if(!hospitalBorrado){
            return res.status(400).json({
                ok: false, 
                mensaje: 'No existe hospital con ese ID',
                errors: {message: 'No existe un hospital con ese id'}
            });
        }
        res.status(200).json({
            ok: true, 
            hospital: hospitalBorrado
        });
    })
});

module.exports= app;