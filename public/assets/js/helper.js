// Helper file to make ajax call to server on various button clicks

//Ajax call to get the data via YouTube Data API
console.log("Inside Helper script");
$('#search-button').click(function(){
				
				$("#ajax_loader").show();
				var timeframe = $('#timeWindow').val();
				console.log(timeframe);
				$.ajax({
					type: 'POST',
					url: '/click',
					data : timeframe,
					beforeSend : function(){
								
								 $("#ajax_loader").show();
								},  
					complete : function(validationResponse){
									console.log("Response came back " + validationResponse.responseText);
									if(validationResponse.responseText =="success"){
										document.getElementById("myDIV").innerHTML = "Data Saved into file";
									}else{
										document.getElementById("myDIV").innerHTML = "Some error occured !! Please try again";
									}
								}
				});
				});


//Ajax call to make a request to Run Hadoop Map-Reduce algorithm on the server				
$('#analyze').click(function(){
				$.ajax({
					type: 'POST',
					url: '/analyze',
					beforeSend : function(){
								document.getElementById("myDIV").innerHTML = "Loading ...";								
								},  
					complete : function(validationResponse){
									console.log("Response came back " + validationResponse.responseText);
									if(validationResponse.responseText =="success"){
										document.getElementById("myDIV").innerHTML = "Command ran successfully";
									}else{
										document.getElementById("myDIV").innerHTML = "Some error occured !! Please try again";
									}
								}
				});
				});				
				