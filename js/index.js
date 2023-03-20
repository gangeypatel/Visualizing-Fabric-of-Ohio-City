var geoJSONdata = {};
const width = 750, height = 700
var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

document.addEventListener("DOMContentLoaded", async () => {
    await modifyData();

    // drawLineMap()
    drawCircleMap()
    // drawPolygonMap()
});

const getCSVdata = () =>
    Promise.all([
        d3.json("data/basemap_points.geojson"),
    ]);

async function modifyData() {
    const [raw_geoJSONdata] = await getCSVdata();
    geoJSONdata = raw_geoJSONdata
    // const projection = d3.geoMercator()
    // .center([0, 0])
    // .scale(100)
    // .translate([width / 2, height / 2]);
    // geoJSONdata.features = geoJSONdata.features.filter((d) => {
    //     console.log("hey")
    //     if(typeof projection(d.geometry.coordinates)[0] != 'number' || typeof projection(d.geometry.coordinates)[1] != 'number') 
    //         console.log(projection(d.geometry.coordinates)[0],projection(d.geometry.coordinates)[1])
    // })
}

function drawPolygonMap() {
    const projection = d3.geoMercator()
        .scale(100)
        .center([0, 0])
        .translate([width / 2, height / 2]);

    // Create a path generator
    const path = d3.geoPath()
        .projection(projection);

    // Draw the polygons
    svg.selectAll('path')
        .data(geoJSONdata.features)
        .enter()
        .append('path')
        .attr('d', d => path(d.geometry));
}


function drawCircleMap() {
    const projection = d3.geoMercator()
        .center([0, 0])
        .scale(100)
        .translate([width / 2, height / 2]);

    svg.selectAll("circle")
        .data(geoJSONdata.features)
        .enter()
        .append("circle")
        .attr("cx", d => {
            const aa = projection(d.geometry.coordinates)[0]
            // console.log(aa)
            return aa
        })
        .attr("cy", d => projection(d.geometry.coordinates)[1])
        .attr("r", 1)
        .attr("fill", "red")
        .attr("stroke", "black")
        .attr("stroke-width", 0.2);

}


function drawLineMap(){
    var projection = d3.geoMercator()
    .center([0, 0])
    .scale(100)
    .translate([width / 2, height / 2]);

  var path = d3.geoPath()
  .projection(projection);
  
svg.selectAll("path")
  .data(geoJSONdata.features)
  .enter()
  .append("path")
  .attr("d", path);

}
