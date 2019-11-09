/**
 * scripts.js
 *
 * Computer Science 50
 * Final Project
 *
 * Global JavaScript.
 */

$(function () {

// Declare variables
var chartbox = d3.select("#mapContainer").append("div").attr("class", "chartbox hidden")
	.on("click", hideChartbox);

var width = document.getElementById("mapContainer").offsetWidth,
	height = width / 1.7;

var projection = d3.geo.kavrayskiy7()
	.scale( width / 2 / Math.PI)
	.translate([width / 2, height / 2])
	.precision(.1);

var path = d3.geo.path()
	.projection(projection)

var color = d3.scale.category10();

var svg = d3.select("#mapContainer").append("svg")
	.attr("width", width) 
	.attr("height", height);

var pairIndexWithId = {};
var pairCountryWithId = {};
var pairCountryCodeWithId = {};

var chartType;
var statistic;

var id;

// Set up header buttons
// Button 1
$('.btn1').hover(function () {
	$('.btn1 .dropdown-content').show();
}, function () {
	$('.btn1 .dropdown-content').hide();
});

$('.btn1 .option1').click(function () {
	chartType = $(this).text();
	$('.btn1 > button').text($(this).text());
	$('.btn1 .dropdown-content').hide();
	reconfigureChart();
});

$('.btn1 .option2').click(function () {
	chartType = $(this).text();
	$('.btn1 > button').text($(this).text());
	$('.btn1 .dropdown-content').hide();
	reconfigureChart();
});

// Button 2
$('.btn2').hover(function () {
	$('.btn2 .dropdown-content').show();
}, function () {
	$('.btn2 .dropdown-content').hide();
});

$('.btn2 .option1').click(function () {
	statistic = $(this).text();
	$('.btn2 > button').text($(this).text());
	$('.btn2 .dropdown-content').hide();
	reconfigureChart();
});

$('.btn2 .option2').click(function () {
	statistic = $(this).text();
	$('.btn2 > button').text($(this).text());
	$('.btn2 .dropdown-content').hide();
	reconfigureChart();
});

$('.btn2 .option3').click(function () {
	statistic = $(this).text();
	$('.btn2 > button').text($(this).text());
	$('.btn2 .dropdown-content').hide();
	reconfigureChart();
});

$('.btn2 .option4').click(function () {
	statistic = $(this).text();
	$('.btn2 > button').text($(this).text());
	$('.btn2 .dropdown-content').hide();
	reconfigureChart();
});

$('.btn2 .option5').click(function () {
	statistic = $(this).text();
	$('.btn2 > button').text($(this).text());
	$('.btn2 .dropdown-content').hide();
	reconfigureChart();
});


// Begin drowing the map
svg.append("defs").append("path")
	.datum({type: "Sphere"})
	.attr("id", "sphere")
	.attr("d", path);

svg.append("use")
	.attr("class", "stroke")
	.attr("xlink:href", "#sphere");

svg.append("use")
	.attr("class", "fill")
	.attr("xlink:href", "#sphere");

queue()
	.defer(d3.json, "bin/world-50m.json") // world
	.defer(d3.csv, "bin/data.csv") // data
	.await(ready);




function ready(error, world, data) {
	if (error) throw error;

	// Store CSV file contents
	data.forEach(function(d) {
		pairCountryWithId[d.id] = d.country;
		pairIndexWithId[d.id] = d.index;
		pairCountryCodeWithId[d.id] = d.ISOcode;
	});

	var countries = topojson.feature(world, world.objects.countries).features,
		neighbors = topojson.neighbors(world.objects.countries.geometries);

	svg.append("g")
		.attr("class", "world")
		.selectAll(".country")
		.data(countries)
		.enter().append("path")
		.attr("class", function(d) { return "country id" + d.id; })
		.attr("d", path)
		.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); })
		.on("click", handleClick)
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut);
		//.on("mousemove", handleMouseMove)

	// Draw country boundaries/mesh
	svg.append("path")
		.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
		.attr("class", "boundary")
		.attr("d", path);
};




function handleClick(d) {
	// Get x/y values
	var xPosition = d3.event.pageX;
	var yPosition = d3.event.pageY - 25;
	id = d.id;

	// Update the chartbox position and value
	hideChartbox();

	chartbox
		.style("left", xPosition + "px")
		.style("top", yPosition + "px");

	configureChartbox(d.id);
	
};


function handleMouseOver(d) {
	// Highlight country
	d3.select(this).style({ 'fill-opacity': 1 });
};


function handleMouseOut(d) {
	// Dim country
	d3.select(this).style({ 'fill-opacity': 0.7 });
};


// Not in use
function handleMouseMove(d) {
	//offsets for chartbox
	var offsetL = document.getElementById("mapContainer").offsetLeft;
	var offsetT = document.getElementById("mapContainer").offsetTop - 25;

	d3.select(this).style({ 'fill-opacity': 1 });
	var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
	chartbox
		.classed("hidden", false)
		.attr("style", "left:" + (mouse[0] + offsetL) + "px; top:" + (mouse[1] + offsetT) + "px")
		.text(pairCountryWithId[d.id]);
};


function hideChartbox(d) {
	//Hide the chartbox
	chartbox.classed("hidden", true);
	chartbox.html("");
	d3.select("div.tooltip, div.nvtooltip").remove();
};


function reconfigureChart() {
	if ( $(".chartbox").hasClass("hidden")) {
		return;
	} else {
		chartbox.html("");
		d3.select("div.tooltip, div.nvtooltip").remove();
		configureChartbox(id);
	};
};


function configureChartbox(id) {

	// Generate request links to Quandl
	var indicator;

	switch(statistic) {
	    case 'GDP Levels':
	        indicator = "PPPGDP";
	        break;
	    case 'Current Account Balance':
	        indicator = "BCA_NGDPD";
	        break;
	    case 'Inflation Rate':
	        indicator = "PCPIPCH";
	        break;
	    case 'Debt-to-GDP Ratio':
	        indicator = "GGXWDG_NGDP";
	        break;
	    case 'Unemployment':
	        indicator = "LUR";
	        break;
	    default:
	        chooseAlert();
	        return;
	};
	
	var quandlLink = "https://www.quandl.com/api/v3/datasets/ODA/" + pairCountryCodeWithId[id] + "_" + indicator + ".json" + "?order=asc&auth_token=UQDo4Jbung9wRp5EB7pV";

	// Parse the date / time
	var parseDate = d3.time.format("%Y-%m-%d").parse;

	if (chartType == 'Line Chart') {
		$.get(quandlLink)
			.success(function(data) {
				//change to global variable
				var dataset = data.dataset.data; //JSON.stringify(dataset)
				// Prepare data
				dataset.forEach(function(d) {
					d[0] = parseDate(d[0]);
					d[1] = +d[1];
				});

				var index;

				if (pairIndexWithId[id] != "") { index = pairIndexWithId[id]; } else { index = "N/A"; }

				chartbox.html( "<h2 id='title'>" + pairCountryWithId[id] + "</h2>" + data.dataset.name );
				//chartbox.html( "<h2 id='title'>" + pairCountryWithId[id] + "</h2>" + "<p>" +"Major Stock Index: " + index + "</p>" + data.dataset.name );
				// Function calls to generate charts
				generateLineChart(dataset);
				chartbox
					.classed("hidden", false);
			})
			.fail(function() {
				alert("No data for this country or territory");
			});
	} else if (chartType == 'Bar Chart') {
		$.get(quandlLink)
			.success(function(data) {
				//change to global variable
				var dataset = data.dataset.data; //JSON.stringify(dataset)
				// Prepare data
				dataset.forEach(function(d) {
					d[0] = parseDate(d[0]);
					d[1] = +d[1];
				});
				chartbox.html( "<h2 id='title'>" + pairCountryWithId[id] + "</h2>" + data.dataset.name );
				//generateBarChart(dataset);
				generateNVD3BarChart(dataset);
				chartbox
					.classed("hidden", false);
			})
			.fail(function() {
				alert("No data for this country or territory");
			});
	} else {	
		chooseAlert();
	};
	
};


// Draw Line Chart
function generateLineChart(dataset) {
	var margin = {top: 10, right: 20, bottom: 20, left: 50},
		w = 425 - margin.left - margin.right,
		h = 200 - margin.top - margin.bottom;

	// Set the ranges
	var x = d3.time.scale().range([0, w]);
	var y = d3.scale.linear().range([h, 0]);

	// Scale the range of the data
	x.domain(d3.extent(dataset, function(d) { return d[0]; }));
	y.domain([d3.min(dataset, function(d) { return d[1]; }) * 0.9 , d3.max(dataset, function(d) { return d[1]; }) * 1.1 ]);

	// Define the axes
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(7)
		.outerTickSize(0);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10)
		.outerTickSize(0);

	// function for the x grid lines
	function make_x_axis() {
	    return d3.svg.axis()
	        .scale(x)
	        .orient("bottom")
	        .ticks(7)
	};

	// function for the y grid lines
	function make_y_axis() {
	  return d3.svg.axis()
	      .scale(y)
	      .orient("left")
	      .ticks(10)
	};

	// Define the line
	var valueline = d3.svg.line()
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[1]); });

	var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);
		 
	// Adds the svg canvas
	var chart = d3.select(".chartbox")
		.append("svg")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Add the X Axis
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

	// Add the Y Axis
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis);

    // Draw the x Grid lines
    chart.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + h + ")")
        .call(make_x_axis()
            .tickSize(-h, 0, 0)
            .tickFormat("")
        );

    // Draw the y Grid lines
    chart.append("g")            
        .attr("class", "grid")
        .call(make_y_axis()
            .tickSize(-w, 0, 0)
            .tickFormat("")
        );

	// Add the valueline path
	chart.append("path")
		  .attr("class", "line")
		  .attr("d", valueline(dataset));

	var formatTime = d3.time.format("%Y");

	// Add the scatterplot
	chart.selectAll("dot")
		.data(dataset)
	.enter().append("circle")
		.attr("r", 2.5)
		.attr("cx", function(d) { return x(d[0]); })
		.attr("cy", function(d) { return y(d[1]); })
		.style("fill", "#fff")
		.style("stroke", "#23415a")
		.on("mouseover", function(d) {
			d3.select(this).style("fill", "#23415a")
			tooltip.transition()
				.duration(200)
				.style("opacity", .9);
			tooltip.html("<strong>" + formatTime(d[0]) + "</strong>" + "<br/>" + d[1])
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
			})
		.on("mouseout", function(d) {
			tooltip.transition()
				.duration(300)
				.style("opacity", 0)
				d3.select(this).style("fill", "#fff");
		});
};


// Draw NVD3 Bar Chart
function generateNVD3BarChart(dataset) {

	var margin = {top: 10, right: 20, bottom: 20, left: 50},
		w = 425 - margin.left - margin.right,
		h = 200 - margin.top - margin.bottom;

	d3.select(".chartbox")
		.append("svg")
			.attr("id", "nvd3BarChart");

	var dataProper;

	dataProper = [{
		values: dataset,
		key: "GDP Change",
		color: "#ff7f0e"
	}].map(function(series) {
		series.values = series.values.map(function(d, i) { return {x: d[0], y: d[1] } });
		return series;
	});

	drawChart();

	function drawChart() {
		var chart;
		nv.addGraph(function() {
			chart = nv.models.historicalBarChart();
			chart
				.margin(margin)
				.width(w + margin.left + margin.right)
				.height(h + margin.top + margin.bottom)
				.duration(200);

			chart.tooltip.contentGenerator(function (obj) {
				var year = d3.time.format("%Y");
				var change = d3.format(".0f");
				return '<h3><strong>' + year(obj.data.x) + '</strong></h3>' + '<p>' + change(parseFloat(obj.data.y)) + '</p>';
			})

			chart.xAxis
				//.axisLabel('Year')
				.tickFormat(function(d) {
					return d3.time.format("%Y")(new Date(d))
				})
				.showMaxMin(false)
				.ticks(7)
				.rotateLabels(0);

			chart.yAxis
				//.axisLabel('GDP Change')
				.tickFormat(function(d) { return d3.format(",.0")(d); })
				.showMaxMin(false);
			
			d3.select("#nvd3BarChart")
				.datum(dataProper)
				.call(chart)
				.style({ 'width': w + margin.left + margin.right, 'height': h + margin.top + margin.bottom });
			nv.utils.windowResize(chart.update);
			chart.dispatch.on("stateChange", function(e) { nv.log("New State:", JSON.stringify(e)); });
			return chart;
		});

	};

};


// Draw Bar Chart
function generateBarChart(dataset) {
	// Width and height
	var margin = {top: 10, right: 20, bottom: 20, left: 50},
		w = 400 - margin.left - margin.right,
		h = 200 - margin.top - margin.bottom;

	// Set the scales
	var xScale = d3.scale.ordinal()
		.domain(d3.range(dataset.length))
		.rangeRoundBands([0, w], 0.1);

	var yScale = d3.scale.linear()
		.domain(d3.extent(dataset, function(d) { return d[1]; }).reverse())
		.range([0, h]);

	var colorScale = d3.scale.linear()
		.domain([d3.min(dataset, function(d) { return d[1]; }), d3.max(dataset, function(d) { return d[1]; })])
		.range([0, 255]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(xScale)
		.orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(yScale)
		.orient("left").ticks(5);

	// Set the text date format
	var yearTextFormat = d3.time.format("%y");
		
	// Create SVG element
	var chart = d3.select(".chartbox")
		.append("svg")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Create bars
	chart.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
				return xScale(i);
		})
		.attr("y", function(d) {
				return h - yScale(d[1]);
		})
		.attr("width", xScale.rangeBand())
		.attr("height", function(d) {
				return yScale(d[1]);
		})
		.attr("fill", function(d) {
			return "rgb(0, 0, " + Math.round(colorScale(d[1])) + ")";
		});

	// Create labels
	chart.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d) {
				return d[1];
		})
		.attr("text-anchor", "middle")
		.attr("x", function(d, i) {
				return xScale(i) + xScale.rangeBand() / 2;
		})
		.attr("y", function(d) {
				return h - yScale(d[1]) + 14;
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "8px")
		.attr("fill", "white");

	// Add the X Axis
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

	// Add the Y Axis
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis);
};


function chooseAlert() {
	if (statistic==null & chartType==null) {
		$(".btn1>button").animate( { backgroundColor: "#1e4620" }, 200 );
		$(".btn1>button").animate( { backgroundColor: "#4CAF50" }, 200 );
		$(".btn1>button").animate( { backgroundColor: "#1e4620" }, 200 );
		$(".btn1>button").animate( { backgroundColor: "#4CAF50" }, 200 );
		$(".btn2>button").animate( { backgroundColor: "##662800" }, 200 );
		$(".btn2>button").animate( { backgroundColor: "#ff6600" }, 200 );
		$(".btn2>button").animate( { backgroundColor: "##662800" }, 200 );
		$(".btn2>button").animate( { backgroundColor: "#ff6600" }, 200 );
	} else if (chartType==null) {
		$(".btn1>button").animate( { backgroundColor: "#1e4620" }, 200 );
		$(".btn1>button").animate( { backgroundColor: "#4CAF50" }, 200 );
		$(".btn1>button").animate( { backgroundColor: "#1e4620" }, 200 );
 		$(".btn1>button").animate( { backgroundColor: "#4CAF50" }, 200 );
	} else if (statistic==null) {
		$(".btn2>button").animate( { backgroundColor: "##662800" }, 200 );
		$(".btn2>button").animate( { backgroundColor: "#ff6600" }, 200 );
		$(".btn2>button").animate( { backgroundColor: "##662800" }, 200 );
		$(".btn2>button").animate( { backgroundColor: "#ff6600" }, 200 );
	};
};


});
