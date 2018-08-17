var express = require("express");

var app = express();
var path = require('path');


app.use(express.static(path.join(__dirname + '/public')));
app.use(express.static('node_modules/three')); 
 


app.get("/", function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.listen(3000);       