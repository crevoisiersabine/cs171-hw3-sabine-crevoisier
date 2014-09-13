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
      [".%L", function(d) { return d.getMilliseconds(); }],
      [":%S", function(d) { return d.getSeconds(); }],
      ["%I:%M", function(d) { return d.getMinutes(); }],
      ["%I %p", function(d) { return d.getHours(); }],
      ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
      ["%b %d", function(d) { return d.getDate() != 1; }],
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
    xAxis_o = d3.svg.axis().scale(xScale_o).orient("bottom").tickFormat(customTimeFormat);
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
    xAxis_d = d3.svg.axis().scale(xScale_d).orient("bottom").tickFormat(customTimeFormat);
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
        .attr("d", function(d) { return line_o(d); });

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
        .enter()

    // Create a line corresponding to the data
    health_d.append("path")
        .attr("class", "path detailPath")
        .attr("clip-path", "url(#clip)") //Adding this attribute says to clip this element
        .attr("d", line_d)

    // Fill the space
    health_d.append("path")
        .attr("class", "detailArea")
        .attr("clip-path", "url(#clip)") //Adding this attribute says to clip this element
        .attr("d", area)

    //POINTS DETAIL

    var points_d = detail.selectAll(".point_d")
            .data(dataSet[0])
            .enter().append("circle")
            .attr("class", "point_d")
            .attr("clip-path", "url(#clip)") //Adding this attribute says to clip this element
            .attr("fill", function(d, i) { return  "steelblue"; })
            .attr("cx", function(d, i) { return xScale_d(d.date); })
            .attr("cy", function(d, i) { return yScale_d(d.health); })
            .attr("r", function(d, i) { return  2; });

    //BRUSHING !!
    //This piece of code below clips the graph so that it doesn't go over the edges of the axis during brushing
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var brush = d3.svg.brush().x(xScale_o).on("brush", brushed);
    overview.append("g").attr("class", "brush")
        .call(brush)
        .selectAll("rect")
        .attr({ height: bbOverview.h, transform: "translate(0, 0)" });

    function brushed() {
        //Check if the brush is selected, if so, give the extent as the new domain for the detail graph, if not keep full domain from overview
        xScale_d.domain(brush.empty() ? xScale_o.domain() : brush.extent());
        detail.select(".detailArea").attr("d", area);
        detail.selectAll(".detailPath").attr("d", line_d);
        detail.selectAll(".point_d")
            .attr("cx", function(d) { return xScale_d(d.date); })
            .attr("cy", function(d) { return yScale_d(d.health); });
        detail.select("g.x.axis.detail").call(xAxis_d);
    }
}

