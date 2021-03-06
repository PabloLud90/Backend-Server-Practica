//Requires importacion de librereias
var express = require('express');
var mongoose= require('mongoose');
var bodyParser = require('body-parser');


//inicializar variables
var app= express();

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });
  


//BodyParser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//importar rutas
var appRoutes= require('./routes/app');
var usuarioRoutes= require('./routes/usuario');
var loginRoutes= require('./routes/login');
var medicoRoutes= require('./routes/medico');
var hospitalRoutes= require('./routes/hospital');
var uploadRoutes= require('./routes/upload');
var imagenesRoutes= require('./routes/imagenes');

//ruta busqueda
var busquedaRoutes= require('./routes/busqueda');




//conexion BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res)=>{
    if(err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'Online')

})

//server index  config
// Ultilizado para cargar las imagenes en el navegador pero no es buena practica para
//la privacidad: npm i server-index
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


//rutas
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


//escuchar peticiones
app.listen(3000, () =>{
    console.log('Express Server On Port 3000: \x1b[32m%s\x1b[0m', 'Online')
});
