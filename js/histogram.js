/**
 * Global variables.
 */
var graph, x, y, xAxis, yAxis, histogram, bar, color;

var height = 590;
var width = 4000;

margin = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 60
};

var count = 0;

function makeUpdateHist() {
    color = getColorRange(minData, maxData);
    wdiTopic.sort((a, b) => Number(b[year] - Number(a[year])));
    var commaFormat = d3.format(",.3f");
    var tip = d3.tip()
        .attr('class', 'histogram-tip')
        .offset([-10, 0])
        .html(function (d) {
            // console.log(d);
            var number = d[year];
            if (number != "") {
                return `<strong>${d["Country Name"]}:</strong> ${commaFormat(Number(number))}`;
            }
            return `<strong>${d["Country Name"]}:</strong> <i>Unknown</i>`;
        });

    if (graph) {
        updateHist(tip);
    } else {
        makeHist(tip);
    }

    if (count === 2) {
        count = 0;
    } else {
        count += 1;
    }
}

function makeHist(tip) {
    x = d3.scaleBand()
        .domain(wdiTopic.map(d => d["Country Name"]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    y = d3.scaleLinear()
        .domain([0, maxData]).nice()
        .range([height - margin.bottom, margin.top]);

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    histogram = d3.select("#div-histogram").append("svg")
        .attr("width", width)
        .attr("height", height);

    histogram.call(tip);

    var bar = histogram.append("g")
        .selectAll("rect")
        .data(wdiTopic)
        .enter()
        .append("rect")
        .attr("hist-country-name", d => d["Country Name"])
        .attr("fill", d => color(Number(d[year])))
        .attr("original-color", d => color(Number(d[year])))
        .style("mix-blend-mode", "multiply")
        .attr("x", d => x(d["Country Name"]))
        .attr("y", d => y(Number(d[year])))
        .attr("height", d => y(0) - y(Number(d[year])))
        .attr("width", 18)
        .attr("stroke", "#e0780f")
        .attr("stroke-width", "1px")
        .on("mouseover", function (d) {
            tip.show(d);
            d3.select(`[data-country-name="${d["Country Name"]}"]`)
                .attr("stroke", "#ce3f46")
                .attr("stroke-width", 2);

        })
        .on("mouseout", function (d) {
            tip.hide(d);
            d3.select(`[data-country-name="${d["Country Name"]}"]`)
                .attr("stroke-width", 0);
        })
        .on("click", function (d) {
            d3.select(".histogram-hover").attr("fill", d => d3.select(".histogram-hover").attr("original-color"));
            d3.select(".histogram-clicked").attr("fill", d => d3.select(".histogram-clicked").attr("original-color"));
            d3.select(this).attr("fill", "#7fbc41");

            d3.selectAll(".histogram-hover")
                .classed("histogram-hover", false);
            d3.selectAll(".histogram-clicked")
                .classed("histogram-clicked", false);
            d3.select(this)
                .classed("histogram-clicked", true);

            var offset = d3.select(this).attr("x") +
                d3.select(this).attr("width") / 2 -
                Number($("#div-histogram").css("width").slice(0, -2)) / 2;
            $("#div-histogram").stop(true, false).animate({
                scrollLeft: offset
            }, 500);

            rotateEarth(d["Country Name"]);
        });

    var gx = histogram.append("g")
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "0")
        .attr("dy", ".15em")
        .attr("transform", "rotate(45)");

    var gy = histogram.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    svg.node().update = () => {
        const t = histogram.transition()
            .duration(750);

        bar.data(wdiTopic, d => d["Country Name"])
            .order()
            .transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d["Country Name"]));

        gx.transition(t)
            .call(xAxis)
            .selectAll(".tick")
            .delay((d, i) => i * 20);
    }
    graph = true;
}

function updateHist(tip) {
    x = d3.scaleBand()
        .domain(wdiTopic.map(d => d["Country Name"]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    y = d3.scaleLinear()
        .domain([0, maxData]).nice()
        .range([height - margin.bottom, margin.top]);

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    // console.log(wdiTopic);
    bar = histogram.selectAll("rect")
        .data(wdiTopic)
        .transition()
        .duration(1000)
        .attr("hist-country-name", d => d["Country Name"])
        .attr("fill", d => color(Number(d[year])))
        .attr("original-color", d => color(Number(d[year])))
        .style("mix-blend-mode", "multiply")
        .attr("x", d => x(d["Country Name"]))
        .attr("y", d => y(Number(d[year])))
        .attr("height", d => y(0) - y(Number(d[year])))
        .attr("width", 18)
        .attr("stroke", "#e0780f")
        .attr("stroke-width", "1px")

    var gx = histogram
        .selectAll(".x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "0")
        .attr("dy", ".15em")
        .attr("transform", "rotate(45)");;

    var gy = histogram
        .selectAll(".y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    svg.node().update = () => {
        const t = histogram.transition()
            .duration(750);

        bar.data(data, d => d["Country Name"])
            .order()
            .transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d["Country Name"]));

        gx.transition(t)
            .call(xAxis)
            .selectAll(".tick")
            .delay((d, i) => i * 20);
    }
}