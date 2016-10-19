var youtube = require('youtube-api');
var async = require('async');
var finalResults = [];
var finalResults2 = [];
var totalResults = '';
var inputObject = {};
var count = 0;
//var client = require('https://apis.google.com/js/client.js?onload=onClientLoad');
var publishAfterTime = '';
var publishBeforeTime = '';

var API_ACCESS_KEY = 'AIzaSyD93zoVXfwOKmkxMFU0LWKvkdzQMdm1yOk';

var nextPageToken;
/*
$(document).ready(function() {
	
  $.getScript('https://apis.google.com/js/client.js?onload=onClientLoad');
});

function onClientLoad() {
	gapi.client.load('youtube', 'v3', onYouTubeApiLoad);		
}

function onYouTubeApiLoad() {

	gapi.client.setApiKey(API_ACCESS_KEY);
	
}
*/
exports.clickedSearchButton = function(){

	youtube.authenticate({
    type: 'key',
    key: API_ACCESS_KEY,
  });
	finalResults = [];
    search();
	
}

function search(pageToken) {
	
	var requestOptions = {
		type: 'playlist',
		part: 'snippet',
		q: '',
		maxResults: '50',
	}
	if (pageToken) {
		requestOptions.pageToken = pageToken;
	}
	
	var request = youtube.search.list(requestOptions,function(err,response){
		if (err) return console.log("error");
		var resultsArr = [];
		//nextPageToken = response.nextPageToken;
		for(var x in response.items){
			var playlistResult = new Object();
			playlistResult.playlistId = response.items[x].id.playlistId;
			resultsArr.push(playlistResult)			
		}
		for (var i = 0; i < resultsArr.length; i++) {
			finalResults.push(resultsArr[i]);          
		}
		console.log("Got this many id's :" + finalResults.length);
		if(nextPageToken){
			search(nextPageToken);
		}else{
			console.log("Total videos recieved are :" + finalResults.length);
			getVideoDetails(function(data){
				console.log("Total data came : " + data.length);
				console.log("after get videos");
			});
		}		
	});		  
}

var finalResults3 = [];

function getVideoDetails(callback){
	
	/*var operations = [];
	for(var i =0 ;i<10;i++){
		operations.push(playlistInfoRecursive(finalResults[i].playlistId, null,i,callback));
	}*/	
	/*
	for(var i=0;i<10;i++){
		(playlistInfoRecursive(finalResults[i].playlistId, null,i,callback));	
		//console.log(i);
		test(i);
	}
	*/
	var i =0 ;
	async.whilst(
	function(){ return i<15;},
	function(cback){playlistInfoRecursive(finalResults[i].playlistId, null,i,finalResults2,callback,cback);
	i++;},
	function(err,done){
		console.log("Ho gaya sab");
	}
	);
}


function playlistInfoRecursive(playlistId,pageToken,num,finalResults2,callback,cback){
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
		  //count++;
		  var videoResult = new Object();
		  videoResult.videoId = data.snippet.resourceId.videoId;
		  videoIDString = videoIDString + videoResult.videoId + ",";
		  videoArr.push(videoResult);
	  });
	  
	  var videoIDStringFinal = videoIDString.substring(0, videoIDString.length - 1);
	  var videoIDRequest = youtube.videos.list({
        id: videoIDStringFinal,
		fields : 'items(id,snippet(categoryId),contentDetails(duration),statistics(viewCount,commentCount))',
        part: 'snippet,id,contentDetails,statistics',
        key: API_ACCESS_KEY
      },function(err,response){
		  console.log("Getting Durations ");
		  var categoryIDString = '';
		  async.each(response.items, function(videodata) {
			var videoRequestVideoId = videodata.id;
			  for (var i = 0; i < videoArr.length; i++) {
				if (videoArr[i].videoId === videoRequestVideoId) {
				  videoArr[i].duration = videodata.contentDetails.duration;
				  videoArr[i].viewCount = videodata.statistics.viewCount;
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
		  console.log("Getting Category title ");
		  async.each(response.items, function(categdata) {
			var videocategRequestcategoryId = categdata.id;
			  for (var i = 0; i < videoArr.length; i++) {
				if (videoArr[i].categoryId === videocategRequestcategoryId) {
					videoArr[i].category = categdata.snippet.title;
					//
					count++; 	
					finalResults2.push(videoArr[i]);
					//
				}
			  }
			  console.log("Lenght aayi: " + finalResults2.length);
		  });
	/*	for(var i=0;i<videoArr.length;i++){
			count++;  
            finalResults2.push(videoArr[i]);
			}*/
		//
			console.log("Num is : " + num);
	
	  if(playlistNextPageToken){
		  playlistInfoRecursive(playlistId,playlistNextPageToken,num,finalResults2,callback,cback);
	  }else if(!playlistNextPageToken && (num == 14)){
		  console.log(finalResults2.length);
		  callback(finalResults2);
		  cback();
		  
		 //console.log("Next playlist call");	 
	  }else{
		  console.log("Next playlist call :" + count);
		  cback();
	  }	
		//	
	  });  
	  });	  
		  
	  
	  
	/*  for(var i=0;i<videoArr.length;i++){
			count++;  
            finalResults2.push(videoArr[i]);
			}
			*/
	/*	console.log("Num is : " + num);
	
	  if(playlistNextPageToken){
		  playlistInfoRecursive(playlistId,playlistNextPageToken,num,finalResults2,callback,cback);
	  }else if(!playlistNextPageToken && (num == 9)){
		  callback(finalResults2);
		  cback();
		  
		 //console.log("Next playlist call");	 
	  }else{
		  console.log("Next playlist call :" + count);
		  cback();
	  }	*/	  	  
  });
}