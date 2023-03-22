var geoJSONdata = [], participantsLocation = [];
var participantCoordinates = {}, pointCoordinates = {}

const width = 1200, height = 1200;
var imageWidth = 1076;
var imageHeight = 1144;
var svg = d3.select("svg").attr("width", width).attr("height", height);
var zoom;
var imgLocation = "img/BaseMap.png"

document.addEventListener("DOMContentLoaded", async () => {
    await modifyData();
    addEventListeners();
    setMaxMin();
    drawBaseImageMap();
    drawCircleMap()

    // startWorker()
    // drawParticipants()
});

const getCSVdata = () =>
    Promise.all([
        d3.json("data/merged_points_10000.json"),
        d3.csv("data/participants/ParticipantStatusLogs2.csv")
    ]);

async function modifyData() {
    let [raw_geoJSONdata, raw_participants] = await getCSVdata();
    geoJSONdata = raw_geoJSONdata

    raw_participants.forEach((d) => {
        const str = d.currentLocation.split(" ")
        const x = str[1].substr(1,)
        const y = str[2].substr(0, str[2].length - 1)
        participantsLocation.push([+x, +y])
    })
}

function drawBaseImageMap() {
    svg.append("image")
        .attr("width", imageWidth)
        .attr("height", imageHeight)
        .attr("x", 0)
        .attr("y", 0)
        .attr("xlink:href", imgLocation)
}

function setMaxMin() {
    const participantX = [], participantY = [], pointX = [], pointY = []

    geoJSONdata.forEach((d) => {
        pointX.push(d[0])
        pointY.push(d[1])
    })

    participantsLocation.forEach((d) => {
        participantX.push(d[0])
        participantY.push(d[1])
    })

    participantCoordinates = {
        max: {
            x: d3.max(participantX),
            y: d3.max(participantY)
        },
        min: {
            x: d3.min(participantX),
            y: d3.min(participantY)
        }
    }
    pointCoordinates = {
        max: {
            x: d3.max(pointX),
            y: d3.max(pointY)
        },
        min: {
            x: d3.min(pointX),
            y: d3.min(pointY)
        }
    }
}

function drawCircleMap() {
    svg.selectAll("circle.map_points")
        .data(geoJSONdata)
        .enter()
        .append("circle")
        .attr("class", "map_points")
        .attr("cx", function (d) {
            return d[0];
        })
        .attr("cy", function (d) {
            return d[1];
        })
        .attr("r", 1)
        .attr("fill", "green")
        .style("opacity", 0.5)
}

function drawParticipants() {
    const participantScaleX = d3.scaleLinear()
        .domain([participantCoordinates.max.x, participantCoordinates.min.x])
        .range([pointCoordinates.max.x - 20, 20]);

    const participantScaleY = d3.scaleLinear()
        .domain([participantCoordinates.max.y, participantCoordinates.min.y])
        .range([0, pointCoordinates.max.y - 20]);

    svg.selectAll("circle.participants_points")
        .data(participantsLocation)
        .enter()
        .append("circle")
        .attr("class", "participants_points")
        .attr("cx", function (d) {
            return participantScaleX(d[0]);
        })
        .attr("cy", function (d) {
            return participantScaleY(d[1]);
        })
        .attr("r", 1)
        .attr("fill", "red")
        // .attr("stroke", "red")
        // .attr("stroke-width", 1)
    // .style("opacity",0.5)
}

function startWorker() {
    const chunkSize = 1000;
    participantsLocation = participantsLocation.splice(1,100000)
    const numChunks = Math.ceil(participantsLocation.length / chunkSize);
    for (let i = 0; i < numChunks; i++) {
        console.log("starting",i)
        const startIndex = i * chunkSize;
        const endIndex = Math.min(startIndex + chunkSize, participantsLocation.length);
        const worker = new Worker("js/worker.js");

        worker.postMessage(participantsLocation.slice(startIndex, endIndex));

        worker.onmessage = function (event) {
            drawParticipants(startIndex, endIndex);
            console.log("done",i)
        };

    }
}

function handleZooming(e) {
    svg.select("image").attr("transform", e.transform)
    svg.selectAll("circle")
        .attr("transform", e.transform)
}

function addEventListeners() {
    zoom = d3.zoom().on('zoom', handleZooming)
    svg.call(zoom)
}