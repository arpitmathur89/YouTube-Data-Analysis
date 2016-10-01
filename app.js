var express = require('express'),
        app = express(),
        server = require('http').createServer(app);
		
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

app.get('/endpoint',function(req,res){
	
		// parses the request url
        var theUrl = url.parse( req.url );

        // gets the query part of the URL and parses it creating an object
        var queryObj = queryString.parse( theUrl.query );

         youtubeData = JSON.parse( queryObj.jsonData );
	console.log(youtubeData);
	res.send("successfully received at server side");
	var fields = ['videoId', 'duration', 'viewCount' , 'commentCount'];
	var csv = json2csv({ data: youtubeData, fields: fields });
	fs.writeFile('file.csv', csv, function(err){
	if (err) throw err;
	  console.log('file saved');
	});	
});
server.listen(8080);

console.log('Server is running at port 8080');
