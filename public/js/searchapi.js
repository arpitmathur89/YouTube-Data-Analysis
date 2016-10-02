//Define a Global variables

//finalResults stores the search results from the API search
var finalResults = [];
var totalResults = '';
//inputObject contains all the inputs from the User
var inputObject = {};

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
	
	getPublishBeforeAndAfterTime();
	var requestOptions = {
		type: 'video',
		part: 'snippet',
		q: '',
		maxResults: '50',
		publishedAfter: publishAfterTime,
        publishedBefore: publishBeforeTime
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
		totalResults = 	response.result.pageInfo.totalResults;
		console.log("Total results are : " + totalResults);
		var entryArr = response.result.items;
		for (var i = 0; i < entryArr.length; i++) {
			var videoResult = new Object();
			videoResult.title = entryArr[i].snippet.title;
			videoResult.videoId = entryArr[i].id.videoId;
			videoResult.channelID = entryArr[i].snippet.channelID;
			videoIDString = videoIDString + videoResult.videoId + ",";
			//Push result in Array
			
			resultsArr.push(videoResult);
		}					
	var videoIDStringFinal = videoIDString.substring(0, videoIDString.length - 1);
	var videoIDRequest = gapi.client.youtube.videos.list({
        id: videoIDStringFinal,
		fields : 'items(id,snippet(categoryId),contentDetails(duration),statistics(viewCount,commentCount))',
        part: 'snippet,id,contentDetails,statistics',
        key: API_ACCESS_KEY
      });	
	  //execute request and process the response object to pull in viewcount and comment count and duration
      videoIDRequest.execute(function(response) {
		//iterate through the response items and execute a callback function for each
		var categoryIDString = '';
		  $.each(response.items, function() {
			var videoRequestVideoId = this.id;
			  for (var i = 0; i < resultsArr.length; i++) {
				if (resultsArr[i].videoId === videoRequestVideoId) {
				  resultsArr[i].duration = this.contentDetails.duration;
				  resultsArr[i].viewCount = this.statistics.viewCount;
				  resultsArr[i].commentCount = this.statistics.commentCount;
				  resultsArr[i].categoryId = this.snippet.categoryId;
				  categoryIDString = categoryIDString + resultsArr[i].categoryId + ",";
				  break;
				}
			  }
		  });
	var categoryIDStringFinal = categoryIDString.substring(0, categoryIDString.length - 1);	  
	var categoryIDRequest = gapi.client.youtube.videoCategories.list({
        id: categoryIDStringFinal,
        part: 'snippet',
        key: API_ACCESS_KEY
      });

		categoryIDRequest.execute(function(response) {
		//iterate through the response items and execute a callback function for each
		  $.each(response.result.items, function() {
			var videocategRequestcategoryId = this.id;
			  for (var i = 0; i < resultsArr.length; i++) {
				if (resultsArr[i].categoryId === videocategRequestcategoryId) {
					resultsArr[i].category = this.snippet.title;
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
		 if((nextPageToken && count<150)){
			search(nextPageToken);
		}else {				
			displayfinalResults();
		} 
		});
	}); 
	});
    
}


function clickedSearchButton(){
	
	//reset the input object to remove any old data
	cleanInputObject();
	
	//pull web form data into input object
	inputObject.inputTimeWindow = $('#timeWindow').val();
	
	finalResults = [];
    search();
}

function displayfinalResults() {
	var datajson = JSON.stringify(finalResults);
	$.ajax({
    type: 'GET',
    url: 'http://localhost:8080/endpoint',
    data: {jsonData :JSON.stringify(finalResults)},
    dataType: 'json',
    complete: function(validationResponse) {
        console.log(JSON.stringify(validationResponse));
		if(validationResponse.responseText=="success"){
			document.getElementById("myDIV").innerHTML = "Data Saved into file";
		}
    }
});
	return;
}

/**  This function resets the inputObject, so no old data is carried over
 */
function cleanInputObject() {
  inputObject = {};
}

/**  This function takes a date object and returns a UTC formatted date string
 *  @param {object} - Date object
 *  @return {string} - String with the date in UTC format
 */
function convertDateToTimeDateStamp(dateObj) {
  return dateObj.getUTCFullYear() + '-' + formatAsTwoDigitNumber(dateObj.getUTCMonth() + 1) + '-' + formatAsTwoDigitNumber(dateObj.getUTCDate()) + 'T' + formatAsTwoDigitNumber(dateObj.getUTCHours()) + ':' + formatAsTwoDigitNumber(dateObj.getUTCMinutes()) + ':' + formatAsTwoDigitNumber(dateObj.getUTCSeconds()) + 'Z';
}

/**  This function takes a number and returns its two digital string equivalent
 *  @param {number} - number to be converted
 *  @return {string} - number represented as a two digit string
 */
function formatAsTwoDigitNumber(numb) {
  if (numb < 10) {
    return String('0' + numb);
  } else {
    return String(numb);
  }
}

/**  This function calculates the before and after timestamps needed for the API search and stores them in global variables
 */
function getPublishBeforeAndAfterTime() {
  
  //Time comes from drop down option, convert to UTC format
   
    var nowTime_TimeStamp = convertDateToTimeDateStamp(new Date())
    var nowTimeMilliSecs = new Date().getTime();

    //if publishBeforeTime is blank or the user clicked the search button then
    //set publishBeforeTime to current time.  Otherwise we want to use the value
    //from the URL parameter
    
      publishBeforeTime = nowTime_TimeStamp;
    

    //define the before time in milliseconds by subtracting time window from the time right now
    var thresholdTime = 0;

    numberMilliSecondsInHour = 1000 * 60 * 60;
    if (inputObject.inputTimeWindow === 'hour') {
      thresholdTime = nowTimeMilliSecs - numberMilliSecondsInHour;
    } else if (inputObject.inputTimeWindow === '3hours') {
      thresholdTime = nowTimeMilliSecs - (3 * numberMilliSecondsInHour);
    } else if (inputObject.inputTimeWindow === '6hours') {
      thresholdTime = nowTimeMilliSecs - (6 * numberMilliSecondsInHour);
    } else if (inputObject.inputTimeWindow === '9hours') {
      thresholdTime = nowTimeMilliSecs - (9 * numberMilliSecondsInHour);
    } else if (inputObject.inputTimeWindow === '12hours') {
      thresholdTime = nowTimeMilliSecs - (12 * numberMilliSecondsInHour);
    } else if (inputObject.inputTimeWindow === '24hours') {
      thresholdTime = nowTimeMilliSecs - (24 * numberMilliSecondsInHour);
    } else if (inputObject.inputTimeWindow === 'week') {
      thresholdTime = nowTimeMilliSecs - (24 * 7 * numberMilliSecondsInHour);
    } else if (inputObject.inputTimeWindow === '30days') {
      thresholdTime = nowTimeMilliSecs - (24 * 30 * numberMilliSecondsInHour);
    } else if (inputObject.inputTimeWindow === 'year') {
      thresholdTime = nowTimeMilliSecs - (24 * 365.25 * numberMilliSecondsInHour);
    } else {
      thresholdTime = 0
    }

    //if threshold time is 0 then set before to epoch
    if (thresholdTime === 0) {
      publishAfterTime = '1970-01-01T00:00:00Z';
    } else {
      publishAfterTime = convertDateToTimeDateStamp(new Date(thresholdTime));
    } 
}




