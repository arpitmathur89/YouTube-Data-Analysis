var express = require('express'),
        app = express(),
        server = require('http').createServer(app);
var io = require("socket.io")(server);		
var searchapi = require('./controllers/searchapi');		
var fs = require('fs');
var exec = require('child_process').exec;
var child;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public');
});

io.sockets.on('connection', function (socket) {
	console.log("Connected using sockets");
		
	socket.on('clickedsearch', function(data){	
		var time = data.timeframe;
		socket.emit('getting data', "fetching data");
		searchapi.clickedSearchButton(time,function(finaldata){
				if(finaldata == "success"){
					child = exec('/home/ubuntu/YouTube-Data-Analysis/scripts/getdata.sh',function(error,stdout,stderr){
			if (error) {
				console.error(error);
				socket.emit('getting data', "failed");
				return;
			}
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			socket.emit('getting data', "success");
			});	
			}else{
				socket.emit('getting data', "failed");
			}
			});
	});
		
	
	socket.on('clickedanalyze',function(data){
		
		socket.emit('analyzing data', "analyzing data");
		console.log("Analyzing Data");
		//Execute Hadoop script
		 //For shell script 
		
		child = exec('/home/ubuntu/YouTube-Data-Analysis/scripts/analyzedata.sh',function(error,stdout,stderr){
			var resultdata = {};
			if (error) {
				console.error(error);
				resultdata.response = "error";
				socket.emit('analyzing data', resultdata);
				return;
			}
			
		// To test on Windows
	/*	child = exec('node --version',(error, stdout, stderr)=>{
		var resultdata = {};
		if (error) {
			console.error(error);
			resultdata.response = "error";
			socket.emit('analyzing data', resultdata);
			return;
		} */
		console.log('stdout: ' + stdout); 
		console.log('stderr: ' + stderr);
		//Execute all command and then read tsv code
		var categtsv = fs.readFileSync('/home/ubuntu/YouTube-Data-Analysis/output/outcategory.tsv','utf8');
		//var categtsv = fs.readFileSync('./../output/outcategory.tsv','utf8');
		var categheaders = ["Category","Count"];
		var uploadertsv = fs.readFileSync('/home/ubuntu/YouTube-Data-Analysis/output/outuploader.tsv','utf8');
		//var uploadertsv = fs.readFileSync('./../output/outuploader.tsv','utf8');
		var uploaderheaders = ["Uploader","Count"];
		var viewtsv = fs.readFileSync('/home/ubuntu/YouTube-Data-Analysis/output/outview.tsv','utf8');
		//var viewtsv = fs.readFileSync('./../output/outview.tsv','utf8');
		var viewheaders = ["Title","Count"];

	// Call tsv to JSOn to send the data
		var topcateg = tsvJSON(categtsv,categheaders);
		var topuploader = tsvJSON(uploadertsv,uploaderheaders);
		var topviewed = tsvJSON(viewtsv,viewheaders);
		resultdata.response = "success";
		resultdata.topcategory = topcateg;	
		resultdata.topuploader = topuploader;
		resultdata.topviewed = topviewed;		
		// Function to convert TSV to JSON object
		function tsvJSON(tsv,headers){
					
			  var lines=tsv.split("\n");
			 
			  var result = [];
			 
			  for(var i=0;i<lines.length-1;i++){
			 
				  var obj = {};
				  lines[i] = lines[i].replace(/\"/g,"");
				  var currentline=lines[i].split("\t");
					
				  for(var j=0;j<headers.length;j++){
					  obj[headers[j]] = currentline[j];
				  }
			 
				  result.push(obj);
			 
				}
		
			  
			  return JSON.stringify(result); //JSON
		}
		socket.emit('analyzing data', resultdata);
		});	
	});
	
	socket.on("disconnect", function () {
        console.log("Disconnected");
    });
	
});

	
	
server.listen(8080);

console.log('Server is running at port 8080');
