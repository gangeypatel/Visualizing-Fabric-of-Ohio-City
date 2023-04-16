import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { BuildingContext, DateContext } from "../context";

import imgLocation from '../img/BaseMap.png';
// import data from '../data/circularPacking.json';

function Circular() {
    let d3, d3Lasso;
    //var participantCoordinates = {}, pointCoordinates = {}

    let width = 800, height = 650;
    // const imageWidth = 1076;
    // const imageHeight = 1144;
    // const pointsRadius = 2;

    let svg, node, color,size,x;

    const buildingContext = useContext(BuildingContext)
    const data = buildingContext.selectedBuildings

    const dateContext = useContext(DateContext)
    const date = dateContext.date

    function colorsize() {
        
        color = d3.scaleOrdinal()
            .domain([1, 2, 3])
            .range(["#bee9e8", "#cae9ff", "#5fa8d3"])

        size = d3.scaleLinear()
            .domain([0, 200])
            .range([25, 90])
    }


    useEffect(() => {
        d3 = window.d3;

        svg = d3.select("svg").attr("width", width).attr("height", height);
       
        // addEventListener();
        calculateSVGDimentions();
        // // drawBaseImageMap();
        colorsize();
        drawcircularmap();
    },[]);

    function drawcircularmap() {
        x = d3.scaleOrdinal()
        .domain([1, 2, 3])
        .range([50, 200, 340])

        svg.selectAll("#circles").remove()
        colorsize();
        node = svg
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("id", "circles")
            .attr("r", function (d) { return size(parseInt(d.maxOccupancy)) })
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("fill", function (d) { return color(d.businessType) })
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", 4)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", function(d, i) {
                fetchBusinessData(i.businessId);
            });

        async function fetchBusinessData(businessId) {

            const result = await axios.get("http://127.0.0.1:8002/barchart/" + date + "&" + businessId)
                        .then((d) => {
                            return d.data;
                        });

            console.log(result);
        }


        var simulation = d3.forceSimulation()
            .force("x", d3.forceX().strength(0.1).x(function (d) { return x(width / 2) }))
            .force("y", d3.forceY().strength(0.1).y(width / 2))
            .force("center", d3.forceCenter().x(width / 2).y(height / 2))
            .force("charge", d3.forceManyBody().strength(.1))
            .force("collide", d3.forceCollide().strength(.2).radius(function (d) { return (size(d['maxOccupancy']* 1.5)) }).iterations(1))

        simulation
                    .nodes(data)
                    .on("tick", function (d) {
                        node
                            .attr("cx", function (d) { return d.x; })
                            .attr("cy", function (d) { return d.y; })
                    });

        function dragstarted(event,d) {
            if (!event.active) simulation.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event,d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event,d) {
            if (!event.active) simulation.alphaTarget(.03);
            d.fx = null;
            d.fy = null;
        }

    }

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        width = windowWidth * 0.6;
        height = windowHeight - 100;

        svg.attr("width", width).attr("height", height);
    }


    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg></svg>
        </div>
    );
}

export default Circular;
