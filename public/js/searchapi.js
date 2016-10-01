//Define a Global variables

//finalResults stores the search results from the API search
var finalResults = [];

var count = 0;

//publishAfterTime and publishBeforeTime define the before and after times to submit for the search
var publishAfterTime = '';
var publishBeforeTime = '';

var API_ACCESS_KEY = 'AIzaSyD93zoVXfwOKmkxMFU0LWKvkdzQMdm1yOk';

var nextPageToken,prevPageToken;

$(document).ready(function() {
	
  $.getScript('https://apis.google.com/js/client.js?onload=onClientLoad');
});

function onClientLoad() {
	gapi.client.load('youtube', 'v3', onYouTubeApiLoad);		
}

function onYouTubeApiLoad() {

	gapi.client.setApiKey(API_ACCESS_KEY);
	
}

function search(pageToken) {
	
	
	var requestOptions = {
		type: 'video',
		part: 'snippet',
		q: '',
		maxResults: '50'
	}
	if (pageToken) {
    requestOptions.pageToken = pageToken;
	}
	
	var request = gapi.client.youtube.search.list(requestOptions);
	
	//Call processYouTubeRequest to process the request object
    processYouTubeRequest(request);
	  
}

function processYouTubeRequest(request){
    // Send the request to the API server,
    // and invoke onSearchRepsonse() with the response.
    request.execute(function(response) {
		var resultsArr = [];
		var videoIDString = '';
		nextPageToken = response.result.nextPageToken;	
		var entryArr = response.result.items;
		for (var i = 0; i < entryArr.length; i++) {
			var videoResult = new Object();
			videoResult.title = entryArr[i].snippet.title;
			videoResult.videoId = entryArr[i].id.videoId;
			videoResult.channelID = entryArr[i].snippet.channelID;
			videoResult.videoCategory = entryArr[i].snippet.categoryID;
			videoIDString = videoIDString + videoResult.videoId + ",";
			//Push result in Array
			resultsArr.push(videoResult);
		}					
	var videoIDStringFinal = videoIDString.substring(0, videoIDString.length - 1);
	var videoIDRequest = gapi.client.youtube.videos.list({
        id: videoIDStringFinal,
        part: 'id,contentDetails,statistics',
        key: API_ACCESS_KEY
      });	
	  //execute request and process the response object to pull in viewcount and comment count and duration
      videoIDRequest.execute(function(response) {
		//iterate through the response items and execute a callback function for each
		  $.each(response.items, function() {
			var videoRequestVideoId = this.id;
			  for (var i = 0; i < resultsArr.length; i++) {
				if (resultsArr[i].videoId === videoRequestVideoId) {
				  resultsArr[i].duration = this.contentDetails.duration;
				  resultsArr[i].viewCount = this.statistics.viewCount;
				  resultsArr[i].commentCount = this.statistics.commentCount;
				  break;
				}
			  }
		  });
		  	
		  //remove duplicates from global results list		
        for (var i = 0; i < resultsArr.length; i++) {
          var addResult = true;
          for (var j = 0; j < finalResults.length; j++) {
            if (resultsArr[i].videoId === finalResults[j].videoId) {
              //it is a duplicate, do not add to final results and break inner loop
              addResult = false;
              break;
            }
          }
          if (addResult) {
			count++;  
            finalResults.push(resultsArr[i]);
          }
        }	
		 if(nextPageToken && count<90){
			search(nextPageToken);
		}else {				
			displayfinalResults();
		} 
	 });
	
   });  
}


function clickedSearchButton(){
	finalResults = [];
    search();
}

function displayfinalResults() {
	console.log("Final results yahan pe aayenge" + finalResults.length);
	var datajson = JSON.stringify(finalResults);
	$.ajax({
    type: 'GET',
    url: 'http://localhost:8080/endpoint',
    data: {jsonData :JSON.stringify(finalResults)},
    dataType: 'json',
    complete: function(validationResponse) {
        console.log("send hua JSON sahi se");
		console.log('success');
        console.log(JSON.stringify(validationResponse));
    }
});
/*	xhr = new XMLHttpRequest();
	var url = "url";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
		if (xhr.readyState == 4 && xhr.status == 200) {
			
			console.log("send hua JSON sahi se");
		}
	}
	var data = JSON.stringify(finalResults);
	xhr.send(data);
	*/
	return;
}




