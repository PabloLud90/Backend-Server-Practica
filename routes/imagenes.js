var express= require('express');
var app= express();
//file system
var fs= require('fs');

const path= require('path');

app.get('/:tipo/:img', (req, res, next )=> {

    var tipo= req.params.tipo;
    var img= req.params.img;

    //crea path de la imagen
    var pathImagen= path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if(fs.existsSync(pathImagen)){
        res.sendFile(pathImagen);

    }else{
        var pathNoImagen= path.resolve(__dirname, '../assets/no-imagen.png');
        res.sendFile(pathNoImagen);
    }
});

module.exports= app;