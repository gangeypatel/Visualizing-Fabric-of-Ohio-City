import { useEffect, useState } from "react";
import * as d3 from "d3";

import imgLocation from '../img/BaseMap.png';
import mergedPointsFile from '../data/merged_points_10000.json';

function Heatmap() {
    const [geoJSONdata, setGeoJSONdata] = useState(mergedPointsFile);
    const [participantsLocation, setParticipantsLocation] = useState([]);

    var participantCoordinates = {}, pointCoordinates = {}

    let width = 800, height = 650;
    const imageWidth = 1076;
    const imageHeight = 1144;
    
    let svg, zoom;

    useEffect(() => {
        svg = d3.select("svg").attr("width", width).attr("height", height);
        addEventListener();
        calculateSVGDimentions();
        // drawBaseImageMap();
        drawCircleMap();
    }, []);

    function drawBaseImageMap() {
        svg.append("image")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
            .attr("y", 0)
            .attr("xlink:href", imgLocation)
    }

    function drawCircleMap() {
        if(!svg) return;
        const imageScale  = d3.scaleLinear()
            .domain([0, imageWidth])
            .range([0, width]);
        const imageScaleY = d3.scaleLinear()
            .domain([0, imageHeight])
            .range([0, height]);
        svg.selectAll("circle.map_points").remove();
        svg.selectAll("circle.map_points")
            .data(geoJSONdata)
            .enter()
            .append("circle")
            .attr("class", "map_points")
            .attr("cx", d => imageScale(d[0]))
            .attr("cy", d => imageScaleY(d[1]))
            .attr("r", 1)
            .attr("fill", "green")
            .style("opacity", 0.5)
    }

    function handleZooming(e) {
        svg.select("image").attr("transform", e.transform)
        svg.selectAll("circle")
            .attr("transform", e.transform)
    }

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
      
        width = windowWidth * 0.6;
        height = windowHeight - 100;
      
        svg.attr("width", width).attr("height", height);
    }

    function addEventListener() {
        zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", handleZooming);
        svg.call(zoom);

        window.addEventListener("resize", () => {
            calculateSVGDimentions()
            drawCircleMap()
        });
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg></svg>
        </div>
    );
  }
  
  export default Heatmap;
  