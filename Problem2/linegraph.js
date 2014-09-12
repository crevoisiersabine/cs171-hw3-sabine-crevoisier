/**
 * Created by crevoisiersabine on 9/12/14.
 */
    var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;
    var color = d3.scale.category10();

    margin = {
        top: 10,
        right: 50,
        bottom: 10,
        left: 50
    };

    width = 960 - margin.left - margin.right;

    height = 600 - margin.bottom - margin.top;

    bbVis = {
        x: 0 + 10,
        y: 10,
        w: width - 100,
        h: 400
    };

    dataSet = [];

    svg = d3.select("#vis").append("svg").attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
    }).append("g").attr({
            transform: "translate(" + margin.left + "," + margin.top + ")"
        });


    d3.csv("wikipedia.txt", function(data) {
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

        // convert your csv data and add it to dataSet
        dataSet = color.domain().map(function(name) {
            return {
              name: name,
              values: data.map(function(d) {
                if (+d[name] != 0) { return {date: d.Year, population: +d[name]}; }
              })
            };
          });
        //Define a function to remove the values corresponding to the empty cells in the wikipedia table
        function isNotUndefined(element) {
          return element != undefined;
        }
        dataSet.forEach(function(d){
            d.values = d.values.filter(isNotUndefined);
        })
        
        return createVis();
    });

    createVis = function() {
        var xAxis, xScale, yAxis,  yScale;

		  // example that translates to the bottom left of our vis space:
		  var visFrame = svg.append("g").attr({
		      "transform": "translate(" + bbVis.x + "," + (bbVis.y) + ")"
		  });

          // x, y scales
          xScale = d3.scale.linear().range([0, bbVis.w]);  // define the right domain generically
          xScale.domain(d3.extent(dataSet[1].values, function(d) { return d.date }));

          yScale = d3.scale.linear().range([bbVis.h, 0])  // define the right y domain and range -- use bbVis
          yScale.domain([
            d3.min(dataSet, function(c) { return d3.min(c.values, function(v) { return v.population; }); }),
            d3.max(dataSet, function(c) { return d3.max(c.values, function(v) { return v.population; }); })
          ]);

          // x, y axes
          xAxis = d3.svg.axis().scale(xScale).orient("bottom");
          yAxis = d3.svg.axis().scale(yScale).orient("left");

          visFrame.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(100, 450)")
              .call(xAxis);

          visFrame.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(100, 50)")
              .call(yAxis);

        // Add the text label for the Y axis
          visFrame.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - margin.left)
              .attr("dy", "1em")
              .style("text-anchor", "end")
              .text("Population");

        // Add the text label for the X axis
          visFrame.append("text")
              .attr("y", height - 50)
              .attr("x", (width + 100)/2)
              .style("text-anchor", "middle")
              .text("Years");

        // Creare the line generator for the path element
          var line = d3.svg.line()
            .interpolate("cardinal")
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale(d.population); });

        // Create a variable population and append a g for each prediction model
          var population = visFrame.selectAll(".population")
                .data(dataSet)
                .enter().append("g")
                .attr("class", "population");

        // Create a line corresponding to each prediction model, colourcoded by the predictor
          population.append("path")
              .attr("class", "line")
              .attr("d", function(d) { return line(d.values); })
              .attr("transform", "translate(100, 50)")
              .style("stroke", function(d) { return color(d.name); });

        //Put points on the graph, colourcoded
        for(var i = 0; i < dataSet.length; i++){
          var col = dataSet[i].name;
          var points = visFrame.selectAll(".point")
            .data(dataSet[i].values)
            .enter().append("svg:circle")
            .attr("transform", "translate(100, 50)")
            .attr("fill", function(d, i) { return color(col); })
            .attr("cx", function(d, i) { return xScale(d.date); })
            .attr("cy", function(d, i) { return yScale(d.population); })
            .attr("r", function(d, i) { return 1.5; });
        }

    };
