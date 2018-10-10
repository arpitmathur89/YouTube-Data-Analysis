var youtube = require('youtube-api');
var async = require('async');
var fs = require('fs');
var os = require("os");
var json2csv = require('json2csv');
var finalResults = [];
var inputObject = {};
var count = 0;
var publishAfterTime = '';
var publishBeforeTime = '';

var API_ACCESS_KEY = 'your youtube-api-key';

var nextPageToken;


exports.clickedSearchButton = function(time,done){
	youtube.authenticate({
    type: 'key',
    key: API_ACCESS_KEY,
  });
	finalResults = [];
	count = 0;
	inputObject = {};
	inputObject.inputTimeWindow = time;
	if (fs.existsSync('data.csv')) {
		fs.unlinkSync('data.csv');
	}
    search(null,done);
	
}


function search(pageToken,mycall) {
	
	getPublishBeforeAndAfterTime();
	var requestOptions = {
		type: 'playlist',
		part: 'snippet',
		q: '',
		maxResults: '50',
		publishedAfter: publishAfterTime,
        publishedBefore: publishBeforeTime
	}
	if (pageToken) {
		requestOptions.pageToken = pageToken;
	}
	
	var request = youtube.search.list(requestOptions,function(err,response){
		if (err) return console.log("error");
		var resultsArr = [];
		nextPageToken = response.nextPageToken;
		for(var x in response.items){
			var playlistResult = new Object();
			playlistResult.playlistId = response.items[x].id.playlistId;
			resultsArr.push(playlistResult)			
		}
		for (var i = 0; i < resultsArr.length; i++) {
			finalResults.push(resultsArr[i]);          
		}
		if(nextPageToken){
			search(nextPageToken,mycall);
		}else{
			getVideoDetails(function(data){
				mycall("success");
			});
		}		
	});		  
}

function getVideoDetails(callback){
	
	var i =0 ;
	async.whilst(
	function(){ return i<finalResults.length;},
	function(cback){playlistInfoRecursive(finalResults[i].playlistId, null,i,cback);
	i++;},
	function(err,done){
		callback("success");
	}
	);
}


//youtube.authenticate({'params': {'id': videoArr[i].videoId, 'part': 'statistics'}}, videosListById);

function playlistInfoRecursive(playlistId,pageToken,num,cback){
	var playlistrequest = youtube.playlistItems.list({
    part: 'snippet',
    pageToken: pageToken,
    maxResults: 50,
    playlistId: playlistId,
	key: API_ACCESS_KEY
  },function(err,response){
	  if(err) return callback({error: err});
	  var videoArr = [];
	  var videoIDString = '';
	  var playlistNextPageToken = response.nextPageToken;
	  async.each(response.items,function(data){

		  var videoResult = new Object();

		  videoResult.videoId = data.snippet.resourceId.videoId;
		  videoResult.title = data.snippet.title.replace(/["'\[\]\}\,\{\\]/g, "");

		  videoResult.channelId = data.snippet.channelId;
		  videoIDString = videoIDString + videoResult.videoId + ",";
		  videoArr.push(videoResult);
	  });
	  
	  var videoIDStringFinal = videoIDString.substring(0, videoIDString.length - 1);
	  var videoIDRequest = youtube.videos.list({
        id: videoIDStringFinal,
		fields : 'items(id,snippet(categoryId),contentDetails(duration),statistics(viewCount,commentCount,likeCount,dislikeCount))',
        part: 'snippet,id,contentDetails,statistics',
        key: API_ACCESS_KEY
      },function(err,response){
		  var categoryIDString = '';
		  async.each(response.items, function(videodata) {
			var videoRequestVideoId = videodata.id;
			  for (var i = 0; i < videoArr.length; i++) {
				if (videoArr[i].videoId === videoRequestVideoId) {

console.log(videodata.statistics.likeCount);


				  videoArr[i].duration = videodata.contentDetails.duration;
				  videoArr[i].viewCount = videodata.statistics.viewCount;
                                  videoArr[i].likeCount = videodata.statistics.likeCount;
                                  videoArr[i].dislikeCount = videodata.statistics.dislikeCount;

				  videoArr[i].commentCount = videodata.statistics.commentCount;
				  videoArr[i].categoryId = videodata.snippet.categoryId;
				  categoryIDString = categoryIDString + videoArr[i].categoryId + ",";
				  break;
				}
			  }
		  });
		var categoryIDStringFinal = categoryIDString.substring(0, categoryIDString.length - 1);	  
	var categoryIDRequest = youtube.videoCategories.list({
        id: categoryIDStringFinal,
        part: 'snippet',
        key: API_ACCESS_KEY
      },function(err,response){
		  async.each(response.items, function(categdata) {
			var videocategRequestcategoryId = categdata.id;
			  for (var i = 0; i < videoArr.length; i++) {

				if (videoArr[i].categoryId === 	videocategRequestcategoryId) {
					videoArr[i].category = categdata.snippet.title;					
					count++; 						
					var ytData = videoArr[i];



					var fields = ['title','videoId','categoryId' , 'category', 'duration', 'viewCount' , 'commentCount', 'channelId' ,'likeCount','dislikeCount'];
					var csv = json2csv({ data: ytData, fields: fields, hasCSVColumnTitle: false });
					fs.appendFile('data.csv', csv + os.EOL, function(err){
						if (err) throw err;
					});
				}
			  }
		  });
	
	
	  if(playlistNextPageToken){
		  playlistInfoRecursive(playlistId,playlistNextPageToken,num,cback);
	  }else{
		  console.log("Next Playlist call number: "+ num + " Total Videos Added :" + count);
		  cback();
	  }	
	  });  
	  });	  
		    	  
  });
}


/**  This function takes a date object and returns a UTC formatted date string
 *  @param {object} - Date object
 *  @return {string} - String with the date in UTC format
 */
function convertDateToTimeDateStamp(dateObj) {
  return dateObj.getUTCFullYear() + '-' + formatAsTwoDigitNumber(dateObj.getUTCMonth() + 1) + '-' + formatAsTwoDigitNumber(dateObj.getUTCDate()) + 'T' + formatAsTwoDigitNumber(dateObj.getUTCHours()) + ':' + formatAsTwoDigitNumber(dateObj.getUTCMinutes()) + ':' + formatAsTwoDigitNumber(dateObj.getUTCSeconds()) + 'Z';
}

function formatAsTwoDigitNumber(numb) {
  if (numb < 10) {
    return String('0' + numb);
  } else {
    return String(numb);
  }
}

function getPublishBeforeAndAfterTime() {
  
    var nowTime_TimeStamp = convertDateToTimeDateStamp(new Date())
    var nowTimeMilliSecs = new Date().getTime();

      publishBeforeTime = nowTime_TimeStamp;
    
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
   if (thresholdTime === 0) {
      publishAfterTime = '1970-01-01T00:00:00Z';
    } else {
      publishAfterTime = convertDateToTimeDateStamp(new Date(thresholdTime));
    } 
}
