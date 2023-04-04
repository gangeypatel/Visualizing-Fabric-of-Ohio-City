import { useEffect, useState } from "react";

import imgLocation from '../img/BaseMap.png';
import mergedPointsFile from '../data/merged_points_10000.json';

function Heatmap() {
    let d3,d3Lasso;

    const [geoJSONdata, setGeoJSONdata] = useState(mergedPointsFile);
    const [participantsLocation, setParticipantsLocation] = useState([]);

    var participantCoordinates = {}, pointCoordinates = {}

    let width = 800, height = 650;
    const imageWidth = 1076;
    const imageHeight = 1144;
    const pointsRadius = 2;

    let svg;

    useEffect(() => {
        d3 = window.d3;

        svg = d3.select("svg").attr("width", width).attr("height", height);
        addEventListener();
        calculateSVGDimentions();
        // drawBaseImageMap();
        drawCircleMap();
        initLasso();
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
        if (!svg) return;
        const imageScale = d3.scaleLinear()
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
            .attr("r", pointsRadius)
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
        // zoom = d3.zoom()
        //     .scaleExtent([1, 8])
        //     .on("zoom", handleZooming);
        // svg.call(zoom);

        window.addEventListener("resize", () => {
            calculateSVGDimentions()
            drawCircleMap()
        });
    }

    function onLassoStart() {
        d3Lasso.items().attr("r",pointsRadius).classed("not_possible", true).classed("selected", false);
    }

    function onLassoDraw() {
    //     d3Lasso.possibleItems()
    //       .classed("not_possible",false)
    //       .classed("possible",true);
    //   d3Lasso.notPossibleItems()
    //       .classed("not_possible",true)
    //       .classed("possible",false);
    }

    function onLassoEnd() {
        d3Lasso.items()
          .classed("not_possible",false)
          .classed("possible",false);
      d3Lasso.selectedItems()
          .classed("selected",true)
          .attr("r",5);
    }

    function initLasso() {
        d3Lasso = d3.lasso()
        .closePathDistance(305) 
        .closePathSelect(true) 
        .targetArea(svg)
        .items(svg.selectAll("circle.map_points")) 
        .on("start",onLassoStart) 
        .on("draw",onLassoDraw) 
        .on("end",onLassoEnd); 

        svg.call(d3Lasso);
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg></svg>
        </div>
    );
}

export default Heatmap;
