/**
 * Reference: https://codepen.io/Janchorizo/pen/NzgReK
 * We will mention it when we use copied code.
 */

// create parallel coordinates
function parallel() {
    // set the position parameters
    var width = +d3.select("#div-parallel").style("width").slice(0, -2),
        height = +d3.select("#div-parallel").style("height").slice(0, -2),
        padding = 30,
        brush_width = 20;
    var filters = {};

    var dragging = {};

    var data = wdiByIndicators; // data (formatted for parallel coordinates)

    // get the selected topic names
    var dimensions = d3.keys(wdiByIndicators[0]).filter(function (d) {
        return d != "Country Name";
    });

    var tmp = {};
    dimensions.forEach(function (d) {
        tmp[d] = {
            "name": d
        };
        tmp[d]["range"] = d3.extent(wdiByIndicators, function (p) {
            return +p[d];
        });
    })
    // features which contain the topic name and value range of that topic
    var features = Object.values(tmp);
    // x scale for choosing the position of every axis
    var xScale = d3.scalePoint()
        .domain(dimensions)
        .range([padding + 25, width - 33 - padding]);

    // Each vertical scale. copied code
    var yScales = {};
    features.map(x => {
        yScales[x.name] = d3.scaleLinear()
            .domain(x.range)
            .range([height - padding, padding]);
    });
    yScales.team = d3.scaleOrdinal()
        .domain(features[0].range)
        .range([height - padding, padding]);

    // Each axis generator. copied code
    var yAxis = {};
    d3.entries(yScales).map(x => {
        yAxis[x.key] = d3.axisLeft(x.value);
    });

    // Each brush generator. copied code
    var brushEventHandler = function (feature) {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
            return; // ignore brush-by-zoom
        if (d3.event.selection != null) {
            filters[feature] = d3.event.selection.map(d => yScales[feature].invert(d));
        } else {
            if (feature in filters)
                delete(filters[feature]);
        }
        applyFilters();
    }
    // copied code
    var applyFilters = function () {
        d3.select('g.active').selectAll('path')
            .style('display', d => (selected(d) ? null : 'none'));
    }
    // copied code
    var selected = function (d) {
        var _filters = d3.entries(filters);
        return _filters.every(f => {
            return f.value[1] <= d[f.key] && d[f.key] <= f.value[0];
        });
    }
    // set the brushes of every y axis. half copied
    var yBrushes = {};
    d3.entries(yScales).map(x => {
        var extent = [
            [-(brush_width / 2), padding],
            [brush_width / 2, height - padding]
        ];
        yBrushes[x.key] = d3.brushY()
            .extent(extent)
            .on('brush', () => brushEventHandler(x.key))
            .on('end', () => brushEventHandler(x.key));
    });

    // Paths for data
    var lineGenerator = d3.line();

    var linePath = function (d) {
        return (lineGenerator(dimensions.map(function (p) {
            return [position(p), yScales[p](d[p])];
        })));
    }
    // get the current position of the axis
    function position(d) {
        var v = dragging[d];
        return v == null ? xScale(d) : v;
    }
    // set the transition function
    function transition(g) {
        return g.transition().duration(500);
    }

    d3.select("#para-svg").remove();
    // d3-tip for showing the full name of the topic
    var tip = d3.tip()
        .attr('class', 'parallel-tip')
        .direction('w')
        .html(function (d) {
            return `<strong>${d.name}:</strong>`;
        });

    // Main svg container
    var pcSvg = d3.select('#div-parallel')
        .append('svg')
        .attr("id", "para-svg")
        .attr('width', width)
        .attr('height', height)

    pcSvg.call(tip);

    // Inactive data
    var background = pcSvg.append('g').attr('class', 'inactive').selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', d => linePath(d));

    // Active data
    var foreground = pcSvg.append('g').attr('class', 'active').selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', d => linePath(d));

    // Vertical axis for the features. contain copied data
    var g = pcSvg.selectAll('g.feature')
        .data(features)
        .enter()
        .append('g')
        .attr('class', 'feature')
        .attr('transform', d => ('translate(' + xScale(d.name) + ',0)'))
        .call(d3.drag() // add drag operation on axis to see correlation between any topic
            .subject(function (d) {
                return {
                    x: xScale(d.name)
                };
            })
            .on("start", function (d) {
                dragging[d.name] = xScale(d.name);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d.name] = Math.min(width, Math.max(0, d3.event.x));
                foreground.attr('d', d => linePath(d));;
                dimensions.sort(function (a, b) {
                    return position(a) - position(b);
                });
                xScale.domain(dimensions);
                g.attr("transform", function (d) {
                    return "translate(" + position(d.name) + ")";
                })
            })
            .on("end", function (d) {
                delete dragging[d.name];
                transition(d3.select(this)).attr("transform", "translate(" + xScale(d.name) + ")");
                transition(foreground).attr('d', d => linePath(d));;
                background
                    .attr('d', d => linePath(d))
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));;

    // add axis and brush for each topic
    g.each(function (d) {
        d3.select(this)
            .append('g')
            .attr("class", "g-yAxis")
            .call(yAxis[d.name]);

        d3.select(this)
            .append('g')
            .attr('class', 'brush')
            .call(yBrushes[d.name]);
    });
    // add topic name on the top of the axis.
    g.append("text")
        .attr("text-anchor", "middle")
        .attr('y', padding / 2)
        .text(function (d) {
            return d.name.length > 12 ? d.name.substring(0, 12) + "..." : d.name;
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
}