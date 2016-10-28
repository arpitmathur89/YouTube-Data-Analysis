// Helper file to make ajax call to server on various button clicks


window.onload = function(){ 
    	
	var analyzeButton = document.getElementById("analyze");
	//Ajax call to make a request to Run Hadoop Map-Reduce algorithm on the server
	analyzeButton.onclick = function(){
				
				$.ajax({
					type: 'POST',
					url: '/analyze',
					beforeSend : function(){
								console.log("Analysing Results");
								$("#ajax_loader").show();															
								},  
					complete : function(validationResponse){
									$("#ajax_loader").hide();																
									var resp = JSON.parse(validationResponse.responseText);									
									if(resp.response =="success"){
										console.log("Successfully came back");
										var topcategories = resp.topcategory;
										var topcategchart = document.getElementById("topcategchart");
										drawPieChart(topcategories,topcategchart);
										var topcategtable = document.getElementById("topcategtable");
										$("#topcategtable tr").remove();
										drawTable(topcategories,topcategtable);
										$("#display-results").show();
										//document.getElementById("myDIV").innerHTML = "Command ran successfully";
									}else{
										//document.getElementById("myDIV").innerHTML = "Some error occured !! Please try again";
									}
								}
				});			
	}
	
	function drawPieChart(piedata,selecter){
		console.log("The result is coming as Json : " + piedata);
		var data = $.parseJSON(piedata);
		
		var width = 400,
			height = 250,
			radius = Math.min(width, height) / 2;

		var color = d3.scale.ordinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);
		/*ordinal()
			.range(["#98abc5", "#8a89a6", "#7b6888"]);*/

		var arc = d3.svg.arc()
			.outerRadius(radius - 10)
			.innerRadius(radius - 70);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function (d) {
			return Number(d.Count);
		});



		var svg = d3.select(selecter).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			var g = svg.selectAll(".arc")
				.data(pie(data))
				.enter().append("g")
				.attr("class", "arc");

			g.append("path")
				.attr("d", arc)
				.style("fill", function (d) {
				return color(d.data.Category);
			});

			g.append("text")
				.attr("transform", function (d) {
				return "translate(" + arc.centroid(d) + ")";
			})
				.attr("dy", ".35em")
				.style("text-anchor", "middle")
				.text(function (d) {
				return d.data.Category + " (" + d.data.Count + ")";
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
				//console.log($tr.wrap('<p>').html());
			});
		});
		
		
		
	}
}