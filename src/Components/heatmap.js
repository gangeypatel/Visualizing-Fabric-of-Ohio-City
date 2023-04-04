import { useEffect, useState } from "react";
import * as d3 from "d3";

import imgLocation from '../img/BaseMap.png';
import mergedPointsFile from '../data/merged_points_10000.json';

function Heatmap() {
    const [geoJSONdata, setGeoJSONdata] = useState(mergedPointsFile);
    const [participantsLocation, setParticipantsLocation] = useState([]);

    var participantCoordinates = {}, pointCoordinates = {}

    const width = 1200, height = 1200;
    const imageWidth = 1076;
    const imageHeight = 1144;
    
    let svg, zoom;

    useEffect(() => {
        svg = d3.select("svg").attr("width", width).attr("height", height);
        addEventListener();
        drawCircleMap();
        // drawBaseImageMap();
    }, []);

    function drawBaseImageMap() {
        svg.append("image")
            .attr("width", imageWidth)
            .attr("height", imageHeight)
            .attr("x", 0)
            .attr("y", 0)
            .attr("xlink:href", imgLocation)
    }

    function drawCircleMap() {
        if(!svg) return;
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

    function handleZooming(e) {
        svg.select("image").attr("transform", e.transform)
        svg.selectAll("circle")
            .attr("transform", e.transform)
    }

    function addEventListener() {
        zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", handleZooming);
        svg.call(zoom);
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg></svg>
        </div>
    );
  }
  
  export default Heatmap;
  