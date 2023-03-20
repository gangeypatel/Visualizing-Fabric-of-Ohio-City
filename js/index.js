var geoJSONdata = [];
const width = 1200, height = 1200;
var imageWidth = 1076;
var imageHeight = 1144;
var svg = d3.select("svg").attr("width", width).attr("height", height);
var zoom;
var imgLocation = "img/BaseMap.png"

document.addEventListener("DOMContentLoaded", async () => {
    await modifyData();
    addEventListeners();
    drawBaseImageMap();
    drawCircleMap()
});

const getCSVdata = () =>
    Promise.all([
        d3.json("data/merged_points.json"),
    ]);

async function modifyData() {
    const [raw_geoJSONdata] = await getCSVdata();
    geoJSONdata = raw_geoJSONdata
}

function drawBaseImageMap() {
    svg.append("image")
        .attr("width", imageWidth)
        .attr("height", imageHeight)
        .attr("x", 0)
        .attr("y", 0)
        .attr("xlink:href", imgLocation)
}

function drawCircleMap() {
    svg.selectAll("circle")
        .data(geoJSONdata)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return d[0]; })
        .attr("cy", function (d) { return d[1]; })
        .attr("r", 1)
        .attr("fill", "green")
        // .style("opacity",0.5)

}

function handleZooming(e){
    svg.select("image").attr("transform", e.transform)
    svg.selectAll("circle")
        .attr("transform", e.transform)
}

function addEventListeners(){
    zoom = d3.zoom().on('zoom',handleZooming)
    svg.call(zoom)
}