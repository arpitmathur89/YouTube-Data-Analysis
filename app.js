var express = require('express'),
        app = express(),
        server = require('http').createServer(app);
var path = require('path');
var fs = require('fs');
var stream = fs.createWriteStream("my_file.txt");



app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public');
});

app.get('/index.html', function(req, res){
        res.sendFile(__dirname + '/public/index.html');
});


server.listen(8080);

console.log('Server is running at port 8080');