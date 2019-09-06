SVG = undefined;
projection = undefined;

scale = 1;
width = 960;
// width = 1296;
height = 500;
// height = 790;

path = undefined;

window.onload = function() {
    // The svg
    var svg = d3.select("#container").append("svg")
        .attr("width", width * scale)
        .attr("height", height * scale);

    SVG = svg;

    // Map and projection
    projection = d3.geoMercator()
        // .scale(150 * scale)
    // .scale(85)
    // .scale(120)
    // .translate([width/2, height/2*1.3]);
    // .translate([width/2, height/2 * 1.3 * scale]);

    // A path generator
    path = d3.geoPath()
    .projection(projection);


    // Load world shape AND list of connection
    d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
    .defer(d3.csv, "data/sample_latlng.csv") // Position of circles
    .defer(d3.json, "data/geolocation_sample.geojson")
    // .defer(d3.csv, "data/geolocation.csv")
    .await(ready);
}


function transformGeoCoordToPixels(pixelSize, polarBoundaryValue, coordValue) {
    return (coordValue + polarBoundaryValue) * pixelSize / (2.0 * polarBoundaryValue)
}


function ready(error, dataGeo, link_data, host_data) {
    // Reformat the list of link. Note that columns in csv file are called long1, long2, lat1, lat2
    var link = []
    link_data.forEach(function(row){
      source = [+row.lng1, +row.lat1]
      console.log('source:',source)
      target = [+row.lng2, +row.lat2]
      topush = {type: "LineString", coordinates: [source, target]}
      link.push(topush)
    })

    // Draw the map
    var svg = SVG;
    svg.append("g")
    .selectAll("path")
    .data(dataGeo.features)
    .enter().append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "#fff")
        .style("stroke-width", 0);

    
    // // TODO: try drawing circles
    // svg.selectAll("circle")
    //     // .data(host_data)
    //     .data([aa,bb])
    //     .enter().append("circle")
    //     .attr('r',5)
    //     // .attr('cx', function (d) { return d.lng; })
    //     .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
    //     // .attr('cy', function (d) { return d.lat; })
    //     .attr('cy', function (d) { return projection(d)[1]; })

    //     // .attr('cx',function (d) { return transformGeoCoordToPixels(width, 180.0, d.lng); })
    //     // .attr('cy',function (d) { return transformGeoCoordToPixels(width, 180.0, d.lat); })
        
        
    //     .on("mouseover",function(d) {
    //         console.log("just had a mouseover", d3.select(d));
    //         d3.select(this)
    //             .classed("active",true)
    //         })

    //     .on("mouseout",function(d){
    //         d3.select(this)
    //             .classed("active",false)
    //     })
    


    // draw the hosts as circles on map
    svg.selectAll("circle")
        .data(host_data.features)
        .enter().append("circle")
        .attr('r',5)
        .attr('cx',function(d) {
                console.log("cx", d.geometry.coordinates[0], "->", projection(d.geometry.coordinates)[0] );
                // return projection(d.geometry.coordinates)[0];
                return transformGeoCoordToPixels(width, 180.0, d.geometry.coordinates[0]);
            }
        )
        .attr('cy',function(d) {
                console.log("cy", d.geometry.coordinates[1], "->", projection(d.geometry.coordinates)[1] );
                // return projection(d.geometry.coordinates)[1];
                return transformGeoCoordToPixels(height, 90.0, -d.geometry.coordinates[1]);
            })
        
        .attr('coord', (d) => {
                return [d.geometry.coordinates[0], d.geometry.coordinates[1]];
            })
        
        .on("mouseover",function(d) {
            console.log("just had a mouseover", d3.select(d));
            d3.select(this)
                .classed("active",true)
            })

        .on("mouseout",function(d){
            d3.select(this)
                .classed("active",false)
        })
        

    // Add the path
    svg.selectAll("myPath")
        .data(link)
        .enter()
        .append("path")
        .attr("d", function(d){ return path(d)})
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("stroke-width", 2)

        .on("mouseover",function(d) {
            console.log("just had a mouseover on path", d3.select(d));
            d3.select(this)
                //.classed("active",true)
                .classed("highlight",true)
            })

        .on("mouseout",function(d){
            d3.select(this)
                //.classed("active",false)
                .classed("highlight",false)
        })

}