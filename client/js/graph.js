"use strict"
var d3 = require("d3");

module.exports.Graph = function(){
	
	var svg, xScale, yScale, xAxis, yAxis, line, initLine, tooltip, stocksWrap, dateLabel;
	var sw = 900;
	var sh = 400;

	var margin = {top: 20, right: 50, bottom: 70, left: 50};
	var width = sw - margin.left - margin.right;
	var height = sh - margin.top - margin.bottom;

	var brushM = 25;
	var brushH = margin.bottom - brushM*2;

	var data;
	var parseDate = d3.time.format("%Y-%m-%d").parse;
	
	var totalDays;
	var brush, brushEl, bScale, bAxis;
	var xDomain;

	this.init = function(){
		xScale = d3.time.scale()
    		.range([0, width])

		yScale = d3.scale.linear()
		    .range([height, 0]);

		xAxis = d3.svg.axis()
		    .scale(xScale)
		    .orient("bottom")
		    .innerTickSize(-height)
		    .tickFormat(d3.time.format("%b"));

		yAxis = d3.svg.axis()
		    .scale(yScale)
		    .orient("left")
		    .innerTickSize(-width);

	    line = d3.svg.line()
			.x(function(d) {
				return xScale(parseDate(d[0]));
			})
			.y(function(d) {
				return yScale(d[1]);
			})	

		initLine = d3.svg.line()
			.x(function(d) {
				return xScale(parseDate(d[0]));
			})
			.y(function(d) {
				return height;
			})	

		svg = d3.select("#graph")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		    .attr("viewBox", "0 0 " + sw + " " + sh) 
		  	.append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y-axis")
			.call(yAxis)

		stocksWrap = svg.append("g");

		tooltip = svg.append("g")
			.attr("class", "tooltip");

		tooltip.append("line")
			.attr({x1: 0, y1: 0, x2: 0, y2: height});

		dateLabel = tooltip.append("text")
			.attr("class", "date-label")
			.attr({x: -80});

		svg.append("rect")
	        .attr("width", width)
	        .attr("height", height)
	        .style("fill", "none")
	        .style("pointer-events", "all")
	        .on("mouseover", function() { tooltip.style("display", "block"); })
	        .on("mouseout", function() { tooltip.style("display", "none"); })
	        .on("mousemove", function(){
	        	var x0 = d3.mouse(this)[0];
	        	updateTooltip(x0);
	        });

        svg.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width)
			.attr("height", height);

		
		/////////  brush  ////////////
		bScale = d3.time.scale()
    		.range([0, width])

		bAxis = d3.svg.axis()
		    .scale(bScale)
		    .orient("bottom")
		    .innerTickSize(-brushH)
		    .tickFormat(d3.time.format("%b"));;

		brush = d3.svg.brush()
		    .x(bScale)
		    .on("brush", handleBrush);

	    brushEl = svg.append("g")
			.attr("class", "brush")
			.attr("transform", "translate(0," + (height + brushM) + ")")
			
			
		brushEl.append("rect")
			.attr("class", "brush-bg")
			.attr("width", width)

		brushEl.call(brush)

		brushEl.selectAll("rect")
			.attr("height", brushH)
		
		svg.append("g")
			.attr("class", "b-axis")
			.attr("transform", "translate(0," + (height + brushM + brushH) + ")")
			.call(bAxis);

	}

	this.render = function(dObj){
		data = []
		for(var c in dObj){
			if(dObj[c]){
				data.push(dObj[c])
			}
		}
		if(data.length === 0){
			return;
		}
		var flat = data.reduce(function(p,c){
			return p.concat(c.data)
		},[]);

		setXDomain(flat)

		yScale.domain(d3.extent(flat, function(d){
			return d[1]
		}))

		svg.select(".y-axis")
			.transition()
			.duration(1500)
			.call(yAxis)

		var stocks = stocksWrap.selectAll(".stock")
			.data(data, function(d){
				return d.dataset_code;
			});

		var stockGroups = stocks.enter()
			.append("g")
			.attr("class", "stock")

		stockGroups.append("path")
			.attr("class", function(d,i){return "line line-" + d.cid})
			.attr("d", function(d){return initLine(d.data)});
		
		stockGroups.append("text")
			.attr("class", function(d,i){return "label label-" + d.cid})
			.text(function(d){return d.dataset_code})
			.attr("x", width)
			.attr("y", function(d){return height;})

		stocks.exit().remove()

		var tTips = tooltip.selectAll(".tooltip-group")
			.data(data, function(d){
				return d.dataset_code;
			});
			
		var tGroups = tTips.enter()
			.append("g")
			.attr("class", function(d,i){
				return "tooltip-group tooltip-group-" + d.cid
			})
		tGroups.append("rect")
			.attr("style", "label-bg")
			.attr({width: 60, height: 20, x: 5, y: -20})

		tGroups.append("text")
			.attr("class", "tooltip-label")
			.text(function(d){
				return d.dataset_code;
			})
			.attr({x: 10, y: -5})

		tGroups.append("circle")
			.attr("class", "tooltip-mark")
			.attr("r", 5)

		tTips.exit().remove();

		runTransitions()
	}

	var runTransitions = function(dObj){
		svg.select(".x-axis").transition().duration(1500)
			.call(xAxis)
		svg.select(".b-axis").transition().duration(1500)
			.call(bAxis)
		svg.selectAll(".line").transition().duration(1500)
			.attr("d", function(d){return line(d.data)});
		svg.selectAll(".label").transition().duration(1500)
			.attr("y", function(d){return yScale(d.data[d.data.length-1][1])+15})
	}

	var handleBrush = function(){
		var snapEx = brush.extent();
		snapEx = snapEx.map(function(v){
			return d3.time.day.round(v)
		}) 
		xDomain = snapEx
		totalDays = d3.time.days(xDomain[0], xDomain[1]);
		xScale.domain(xDomain)
		brush.extent(xDomain);
		if(totalDays.length <= 145){
			xAxis.tickFormat(d3.time.format("%b-%d"));
		}else{
			xAxis.tickFormat(d3.time.format("%b"));
		}
		runTransitions()
	}

	var setXDomain = function(f){

		var tmpDom = d3.extent(f, function(d){
			return parseDate(d[0]);
		})

		if(!xDomain){
			xDomain = tmpDom;
			xScale.domain(xDomain)
			totalDays = d3.time.days(xDomain[0], xDomain[1]);
			bScale.domain(xDomain)
			brush.extent(xDomain)
			brush(d3.select(".brush").transition(0));
		}else if(xDomain[0].valueOf() === tmpDom[0].valueOf() && xDomain[0].valueOf() === tmpDom[0].valueOf()){
			return;
		}else{
			bScale.domain(tmpDom)
			brush(d3.select(".brush").transition(0));
		}
	}

	var updateTooltip = function(x){
		var stepW = width/(totalDays.length);
		var stepI = Math.floor(x/stepW);
		var tx = stepW * stepI;

		var targetDate = totalDays[stepI];
		var day = targetDate.getDay();
		var display = "block";
		var dateClass = ""
		if(day === 0 || day === 6){
			display = "none";
			dateClass = " week-day"
		}

    	tooltip.attr({transform: "translate("+ tx +", 0)"})

    	tooltip.selectAll(".tooltip-group")
			.attr("transform", function(d){
				var val = d.data.filter(function(v){
					return isSameDate(targetDate, new Date(v[0]))
				})
				if(val.length != 0){
					val = val[0][1];
				}else{
					val = 0;
				}
				return "translate(0, " + yScale(val) + ")";
			})
			.attr("display", display)

    	tooltip.selectAll(".tooltip-label")
			.text(function(d){
				var val = d.data.filter(function(v){
					return isSameDate(targetDate, new Date(v[0]))
				});
				if(val.length != 0){
					val = val[0][1];
				}else{
					val = 0;
				}
				return  "$" + val.toFixed(2);
			})

		dateLabel.attr("class", "date-label" + dateClass)
			.text(targetDate.toDateString())
	}

	var isSameDate = function(d1, d2) {
		return (
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		);
	}
}