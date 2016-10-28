window.onload = function(){ 
    
	console.log("Inside Helper script");

	var searchButton = document.getElementById("search-button");
	//Ajax call to get the data via YouTube Data API

	searchButton.onclick = function(){
		var timeframe = $('#timeWindow').val();
		console.log(timeframe);
		$.ajax({
			type: 'POST',
			url: '/click',
			data : timeframe,
			beforeSend : function(){
						//document.getElementById("myDIV").innerHTML = "Loading ...";
						console.log("Loading...")
						$("#ajax_loader").show();
						$("#server-response").hide();
						},  
			complete : function(validationResponse){
							$("#ajax_loader").hide();
							console.log("Response came back " + validationResponse.responseText);
							if(validationResponse.responseText =="success"){
								$("#server-response").show();
							}else{
								document.getElementById("server-response").style.color = "red";
								document.getElementById("server-response").innerHTML = "Some error occured !! Please try again";
								$("#server-response").show();
							}
						}
		});
	}
	
}	