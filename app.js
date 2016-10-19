var express = require('express'),
        app = express(),
        server = require('http').createServer(app);
var searchapi = require('./public/js/searchapi');		
var path = require('path');
var fs = require('fs');
var json2csv = require('json2csv');
var url = require( "url" );
var queryString = require( "querystring" );
var youtubeData = {};
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public');
});

app.get('/index.html', function(req, res){
        res.sendFile(__dirname + '/public/index.html');
});


app.post('/click', function(req, res) {
  console.log("Clicked search button");
  searchapi.clickedSearchButton();
 
});

app.post('/endpoint',function(req,res){
	
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		req.on('data', function (jsonData) {
		console.log(JSON.parse(jsonData));
		youtubeData = JSON.parse( jsonData );
		console.log(youtubeData);
		var fields = ['videoId','categoryId' , 'category', 'duration', 'viewCount' , 'commentCount', 'channelId' ];
		var csv = json2csv({ data: youtubeData, fields: fields });
		fs.appendFile('outputfile.csv', csv, function(err){
			if (err) throw err;
			  console.log('file saved');
			  res.send("success");
			});	
			
		});
		
});
server.listen(8080);

console.log('Server is running at port 8080');
