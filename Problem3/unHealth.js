var bbDetail, bbOverview, dataSet, svg;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 960 - margin.left - margin.right;

var height = 800 - margin.bottom - margin.top;

bbOverview = {
    x: 10,
    y: 10,
    w: width,
    h: 50
};

bbDetail = {
    x: 10,
    y: 100,
    w: width,
    h: 300
};

dataSet = [];

svg = d3.select("#visUN").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var format = d3.time.format("%B\ %Y"); //built a date formatter according to the dates in our format


d3.csv("unHealth.csv", function(data) {

    // convert your csv data and add it to dataSet
    dataSet_inter = data.map(function(rows) {
        return {
          date: (+format.parse(rows.Analysis_Date)), //date converted in milliseconds
          health: convertToInt(rows.Women_Health)
        };
    });
    dataSet.push(dataSet_inter);
    // console.log(dataSet[0]);
    createVis();
});

var convertToInt = function(s) {
    return parseInt(s.replace(/,/g, ""), 10);
};

createVis = function() {
    var xAxis_o, xScale_o, yAxis_o,  yScale_o;
    var xAxis, xScale, yAxis,  yScale;
    var customTimeFormat = d3.time.format.multi([
      ["%B", function(d) { return d.getMonth(); }],
      ["%Y", function() { return true; }]
    ]);

    //OVERVIEW

    var overview = svg.append("g")
        .attr({"transform": "translate(" + bbOverview.x + "," + (bbOverview.y) + ")"})
        .attr("class", "overview");

    // x, y scales
    xScale_o = d3.time.scale().range([0, bbOverview.w]);
    xScale_o.domain([
        d3.min(dataSet[0], function(v) { return v.date; }),
        d3.max(dataSet[0], function(v) { return v.date; }),
    ]);

    yScale_o = d3.scale.linear().range([bbOverview.h, 0])
    yScale_o.domain([
        d3.min(dataSet[0], function(v) { return v.health; }),
        d3.max(dataSet[0], function(v) { return v.health; }),
    ]);

    // x, y axes overview
    xAxis_o = d3.svg.axis().scale(xScale_o).orient("bottom").ticks(10).tickFormat(customTimeFormat);
    yAxis_o = d3.svg.axis().scale(yScale_o).orient("left").ticks(4);

    overview.append("g")
        .attr("class", "x axis overview")
        .attr("transform", "translate(0, "+ yScale_o.range()[0] +")") //Shift the x-axis to be at the bottom of the graph
        .call(xAxis_o);

    overview.append("g")
        .attr("class", "y axis overview")
        .call(yAxis_o);

    //DETAIL

    var detail = svg.append("g")
        .attr({"transform": "translate(" + bbDetail.x + "," + (bbDetail.y) + ")"})
        .attr("class", "detail");

    // x, y scales
    xScale_d = d3.time.scale().range([0, bbDetail.w]);
    xScale_d.domain([
        d3.min(dataSet[0], function(v) { return v.date; }),
        d3.max(dataSet[0], function(v) { return v.date; }),
    ]);

    yScale_d = d3.scale.linear().range([bbDetail.h, 0])
    yScale_d.domain([
        d3.min(dataSet[0], function(v) { return v.health; }),
        d3.max(dataSet[0], function(v) { return v.health; }),
    ]);

    // x, y axes detail
    xAxis_d = d3.svg.axis().scale(xScale_d).orient("bottom").ticks(10).tickFormat(customTimeFormat);
    yAxis_d = d3.svg.axis().scale(yScale_d).orient("left").ticks(4);

    detail.append("g")
        .attr("class", "x axis detail")
        .attr("transform", "translate(0, "+ yScale_d.range()[0] +")") //Shift the x-axis to be at the bottom of the graph
        .call(xAxis_d);

    detail.append("g")
        .attr("class", "y axis detail")
        .call(yAxis_d);


    //PATH GENERATOR

    // Create the line generator for the path element - OVERVIEW
    var line_o = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return xScale_o(d.date); })
        .y(function(d) { return yScale_o(d.health); });

    // Create the line generator for the path element - DETAIL
    var line_d = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return xScale_d(d.date); })
        .y(function(d) { return yScale_d(d.health); });

    //AREA GENERATOR

    // Create the area generator for the path element
    var area = d3.svg.area()
        .interpolate("linear")
        .x(function(d) { return xScale_d(d.date); })
        .y0(yScale_d.range()[0])
        .y1(function(d) { return yScale_d(d.health); });

    //DATA OVERVIEW

    // Create a variable health and append a g for each prediction model
    var health = overview.selectAll(".health")
        .data(dataSet)
        .enter().append("g")
        .attr("class", "health");
    // Create a line corresponding to the data
    health.append("path")
        .attr("class", "path overviewPath")
        .attr("d", function(d) { return line_o(d); })
        // .style("stroke", function(d) { return color(d.name); });

    //POINTS OVERVIEW

    var points = overview.selectAll(".point")
            .data(dataSet[0])
            .enter().append("circle")
            .attr("class", "point")
            .attr("fill", function(d, i) { return  "steelblue"; })
            .attr("cx", function(d, i) { return xScale_o(d.date); })
            .attr("cy", function(d, i) { return yScale_o(d.health); })
            .attr("r", function(d, i) { return  1.5; });

    //DATA DETAIL

    // Create a variable health and append a g for each prediction model
    var health_d = detail.selectAll(".health_d")
        .data(dataSet)
        .enter().append("g")
        .attr("class", "health_d");
    // Create a line corresponding to the data
    health_d.append("path")
        .attr("class", "path detailPath")
        .attr("d", function(d) { return line_d(d); })
        // .style("stroke", function(d) { return color(d.name); });
    // Fill the space
    health_d.append("path")
        .attr("class", "detailArea")
        .attr("d", function(d) { return area(d); })

    //POINTS DETAIL

    var points_d = detail.selectAll(".point_d")
            .data(dataSet[0])
            .enter().append("circle")
            .attr("class", "point_d")
            .attr("fill", function(d, i) { return  "steelblue"; })
            .attr("cx", function(d, i) { return xScale_d(d.date); })
            .attr("cy", function(d, i) { return yScale_d(d.health); })
            .attr("r", function(d, i) { return  1.5; });

}

