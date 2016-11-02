window.onload = function(){ 
    

	var searchButton = document.getElementById("search-button");
	//Ajax call to get the data via YouTube Data API

	searchButton.onclick = function(e){
		var timeframe = $('#timeWindow').val();
		
		var socket = io.connect();
		e.preventDefault();
		socket.emit('clickedsearch', {"timeframe":timeframe});
		
		socket.on('getting data',function(data){
			if(data =="fetching data"){
				
				$("#ajax_loader").show();
				$("#server-response").hide();
			}else if(data =="success"){
				$("#ajax_loader").hide();
				$("#server-response").show();
			}else if(data =="failed"){
				document.getElementById("server-response").style.color = "red";
				document.getElementById("server-response").innerHTML = "Some error occured !! Please try again";
				$("#server-response").show();
			}else{
				document.getElementById("server-response").style.color = "red";
				document.getElementById("server-response").innerHTML = "Some error occured !! Please try again";
				$("#server-response").show();	
			}
		});
		
		socket.on('disconnected',function(){
				document.getElementById("server-response").style.color = "red";
				document.getElementById("server-response").innerHTML = "Some error occured !! Please try again";
				$("#server-response").show();
		});
		
	}
	
}	