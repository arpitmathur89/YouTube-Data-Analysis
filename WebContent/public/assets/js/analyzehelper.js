// Helper file to make ajax call to server on various button clicks

window.onload = function(){ 
    	
	var analyzeButton = document.getElementById("analyze");
	//Ajax call to make a request to Run Hadoop Map-Reduce algorithm on the server
	analyzeButton.onclick = function(e){
			
			var socket = io.connect();
			e.preventDefault();
			socket.emit('clickedanalyze', "clicked on analyze");	
			
			socket.on('analyzing data',function(data){
			var resp = data;	
			if(data =="analyzing data"){
				
				$("#ajax_loader").show();
				 d3.select("#topcategchart").selectAll("svg").remove();
				 d3.select("#topviewedchart").selectAll("svg").remove();

			}else if(resp.response =="success"){
				$("#ajax_loader").hide();
				//Collect all JSON objects
				var topcategories = resp.topcategory;
				var topuploader = resp.topuploader;				
				var topviewed = resp.topviewed;
					
				var topcategchart = document.getElementById("topcategchart");				
				drawLegendChart(topcategories,topcategchart);
				var topcategtable = document.getElementById("topcategtable");
				$("#topcategtable tr").remove();
				drawTable(topcategories,topcategtable);
				
				var topviewedchart = document.getElementById("topviewedchart");
				drawHorizontalChart(topviewed, topviewedchart);				
				var topviewedtable = document.getElementById("topviewedtable");
				$("#topviewedtable tr").remove();
				drawTableViews(topviewed,topviewedtable);
				
				var topuploadertable = document.getElementById("topuploadertable");
				$("#topuploadertable tr").remove();
				drawTableUploader(topuploader,topuploadertable);
				
				$("#display-results").show();
				
			}else if(resp.response =="error"){
				$("#ajax_loader").hide();
				console.log("Some Error occured");
			}
		});
				
	}
	
	
	function drawTable(data,selecter){
		
		var tabdata = $.parseJSON(data);
	
		$(function() {
			$.each(tabdata, function(i, item) {
				var $tr = $('<tr>').append(
					$('<td>').text(i+1),
					$('<td>').text(item.Category),
					$('<td>').text(item.Count)					
				).appendTo(selecter);
				
			});
		});
		
		
		
	}
	
	function drawTableViews(data,selecter){
		
		var tabdata = $.parseJSON(data);
	
		$(function() {
			$.each(tabdata, function(i, item) {
				var $tr = $('<tr>').append(
					$('<td>').text(i+1),
					$('<td>').text(item.Title),
					$('<td>').text(item.Count)					
				).appendTo(selecter);
				
			});
		});
		
		
		
	}
	function drawTableUploader(data,selecter){
		
		var tabdata = $.parseJSON(data);
	
		$(function() {
			$.each(tabdata, function(i, item) {
				var $tr = $('<tr>').append(
					$('<td>').text(i+1),
					$('<td>').text(item.Uploader),
					$('<td>').text(item.Count)					
				).appendTo(selecter);
				
			});
		});
		
		
		
	}
	
	function drawLegendChart(dataset,selecter){
		
		var dataset = $.parseJSON(dataset);
		 var width = 360;
        var height = 360;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75;
        var legendRectSize = 18;                                  
        var legendSpacing = 4;                                    

        var color = d3.scale.category20b();

        var svg = d3.select(selecter)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');

        var arc = d3.svg.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);

        var pie = d3.layout.pie()
          .value(function(d) { return Number(d.Count); })
          .sort(null);

        var path = svg.selectAll('path')
          .data(pie(dataset))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) { 
            return color(d.data.Category);
          });

        var legend = svg.selectAll('.legend')                     
          .data(color.domain())                                   
          .enter()                                                
          .append('g')                                            
          .attr('class', 'legend')                                
          .attr('transform', function(d, i) {                     
            var height = legendRectSize + legendSpacing;          
            var offset =  height * color.domain().length / 2;     
            var horz = -2 * legendRectSize;                       
            var vert = i * height - offset;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });                                                     

        legend.append('rect')                                     
          .attr('width', legendRectSize)                          
          .attr('height', legendRectSize)                         
          .style('fill', color)                                   
          .style('stroke', color);                                
          
        legend.append('text')                                     
          .attr('x', legendRectSize + legendSpacing)              
          .attr('y', legendRectSize - legendSpacing)              
          .text(function(d) { return d; });                       

		
	}
	
	function drawHorizontalChart(data,selecter){
		
		
		var tabdata = $.parseJSON(data);
		
		var colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#79BCBF'];
		var w = 800,
		    h = 400;

		var svg = d3.select(selecter)
			.append("svg")
			.attr("width", w)
			.attr("height", h);
	
	
			var max_n = 0;
			for (var d in tabdata) {
				max_n = Math.max(Number(tabdata[d].Count), max_n);
			}
		
			var dx = w / max_n;
			var dy = h / tabdata.length;
			
			var colorScale = d3.scale.quantize()
						.domain([0,tabdata.length])
						.range(colors);
						
			// bars
			var bars = svg.selectAll(".bar")
				.data(tabdata)
				.enter()
				.append("rect")
				.attr("class", function(d, i) {return "bar " + d.Title;})
				.attr("x", function(d, i) {return 0;})
				.attr("y", function(d, i) {return dy*i;})
				.style('fill',function(d,i){ return colorScale(i); })
				.attr("width", function(d, i) {return dx*Number(d.Count)})
				.attr("height", dy);
	
			// labels
			var text = svg.selectAll("text")
				.data(tabdata)
				.enter()
				.append("text")
				.attr("class", function(d, i) {return "label " + d.Title;})
				.attr("x", 2)
				.attr("y", function(d, i) {return dy*i + 15;})
				.text( function(d) {return d.Title + "  ( Views: " + d.Count  + ")";})
				.attr("font-size", "12px")
				.style("font-weight", "bold");
		


	
		
	}
}
