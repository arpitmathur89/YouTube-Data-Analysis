var express = require('express'),
        app = express(),
        server = require('http').createServer(app);
var searchapi = require('./controllers/searchapi');		
var path = require('path');
var fs = require('fs');
var json2csv = require('json2csv');
var url = require( "url" );
var qs = require( "querystring" );
var exec = require('child_process').exec;
var child;
var youtubeData = {};


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public');
});

app.post('/click', function(req, res) {

  var body ='';
  req.on('data',function(data){
	  
	  body += data;
	  if (body.length > 1e6) { 
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                req.connection.destroy();
            }
  });
  req.on('end', function () {

            var Mydata = qs.parse(body);
			var time = Mydata.timeframe;
			searchapi.clickedSearchButton(time,function(done){
				res.send("success");
			});
  });
});

app.post('/analyze',function(req,res){
	child = exec('node --version',(error, stdout, stderr) =>{
		if (error) {
			console.error(error);
			return;
		}
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		res.send("success");
	});
	
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
