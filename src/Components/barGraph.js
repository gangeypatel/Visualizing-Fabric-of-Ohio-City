import { useEffect, useRef } from "react";
import { select, scaleBand, scaleLinear } from 'd3';
import originalData from '../data/BarChartPieChart.json';
import * as d3 from 'd3';

function BarGraph() {
    let width = 900, height = 400;
    const margin = { top: 10, right: 80, bottom: 40, left: 30 };
    let svg, data = [];
    const svgRef = useRef();

    data = Object.entries(originalData).map(([hour, { participants }]) => ({
        hour,
        totalParticipants: participants.length,
    }));

    useEffect(() => {
        svg = select(svgRef.current).attr("width", width).attr("height", height);
        calculateSVGDimentions();
        drawBarGraph();
    }, []);

    function drawBarGraph() {
        const x = scaleBand()
        .domain(data.map(({ hour }) => hour))
        .range([0, width-margin.right])
        .padding(0.1);

    const y = scaleLinear()
        .domain([0, Math.max(...data.map(({ totalParticipants }) => totalParticipants))])
        .range([height - margin.bottom, 0]);

    svg.selectAll("*").remove();

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0, ${height - margin.bottom} )`)
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Total Participants");

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", ({ hour }) => x(hour))
        .attr("y", ({ totalParticipants }) => y(totalParticipants))
        .attr("width", x.bandwidth())
        .attr("height", ({ totalParticipants }) => height - y(totalParticipants) - margin.bottom);
    }

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        width = windowWidth * 0.6;
        height = windowHeight - 500;
    
        svg.attr("width", width).attr("height", height);
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg ref={svgRef}></svg>
        </div>
    );
}

export default BarGraph;
