//Requires importacion de librereias
var express = require('express');

//inicializar variables
var app= express();


//rutas
app.get('/', (req, res, next )=> {
    res.status(200).json({
        ok: true, 
        mensaje: 'Peticion realizada'
    })
});

//escuchar peticiones
app.listen(3000, () =>{
    console.log('Express Server On Port 3000: \x1b[32m%s\x1b[0m', 'Online')
});
