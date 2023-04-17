import { useEffect, useState } from "react";
import rawJsonData from '../data/BarChartPieChart.json'

function Radar() {
    const [svgDimention, setSvgDimention] = useState({
        width: 800,
        height: 650
    })

    const d3 = window.d3;

    useEffect(() => {
        calculateSVGDimentions();
        const data = modifyData();
        drawRadarChart(data);
    }, []);

    function modifyData() {
        const spendingValues = [];
        
        rawJsonData.forEach((item) => {
            const spending = item.spending;
            if (typeof spending === "string" && spending.startsWith("0.0")) {
                spendingValues.push(0);
            } else {
                spendingValues.push(parseFloat(spending));
            }
        });

        return spendingValues;
    }

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setSvgDimention({
            width: windowWidth - 100,
            height: windowHeight - 100
        })
    }

    function drawRadarChart(data) {

        d3.select("#radar_svg").select("*").remove();
        d3.select("#radar_svg").select("circle").remove();
        d3.select("#radar_svg").select("path").remove();
        d3.select("#radar_svg").select("text").remove();

        const numAxis = data.length;
        const angleSlice = (Math.PI * 2) / numAxis;
        const radius = d3.min([svgDimention.width, svgDimention.height]) / 2 * 0.85;

        const svg = d3.select("#radar_svg").attr("width", svgDimention.width).attr("height", svgDimention.height);
        const g = svg.append("g").attr("transform", `translate(${svgDimention.width / 2},${svgDimention.height / 2})`);

        // Draw the axis
        const axis = g.selectAll(".axis")
            .data(d3.range(numAxis))
            .enter()
            .append("g")
            .attr("class", "axis");

        const tooltip = d3.select("#radar_svg")
            .append("text")
            .style("visibility", "hidden")
            .style("font-size", "16px");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("stroke", "darkblue")
            .style("opacity", 0.3)
            .on("mouseover", function (d, i) {
                d3.select(this)
                    .style("stroke", "darkblue")
                    .style("stroke-width", "3px")
                    .style("opacity", 1.0)
                    .attr("stroke", "darkblue");
                const spending = data[i];
                console.log(spending);
                // console.log(d);
                tooltip.text(`Spending: ${spending}`)
                    .style("visibility", "visible")
                    .attr("x", 630)
                    .attr("y", 54);

            })

            // .on("mousemove", function(d,i) {
            //     tooltip.attr("x", d.pageX)
            //         .attr("y", d.pageY);
            // })
            .on("mouseout", function () {
                d3.select(this)
                    .style("stroke", "darkblue")
                    .style("stroke-width", "1px")
                    .style("opacity", 0.3);

                tooltip.style("visibility", "hidden");
            })
            .transition()
            .duration(3000)
            .attr("x1", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y1", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("x2", 0)
            .attr("y2", 0);
        // .attr("x1", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2)) // change the x2 and y2 attributes to animate the transition
        // .attr("y1", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2));

        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", 0)
            .attr("y", 0)
            // .attr("x", (d, i) => radius * 1.105 * Math.cos(angleSlice * i - Math.PI / 2))
            // .attr("y", (d, i) => radius * 1.105 * Math.sin(angleSlice * i - Math.PI / 2))
            .text((d, i) => {
                const hour = i + 1;
                if (hour === 12) {
                    return `12:00 PM`;
                } else if (hour === 24) {
                    return `12:00 AM`;
                } else if (hour > 12) {
                    return `${hour - 12}:00 PM`;
                } else {
                    return `${hour}:00 AM`;
                }
            })

            .transition() // add a transition
            .delay((d, i) => i * 80) // delay each transition by a multiple of 100ms
            .attr("x", (d, i) => radius * 1.12 * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => radius * 1.12 * Math.sin(angleSlice * i - Math.PI / 2));


        const circle = svg.append("circle")
            .attr("cx", svgDimention.width / 2)
            .attr("cy", svgDimention.height / 2)
            .attr("r", radius)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", "12px")
            .style("opacity", 0.75);


        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        // // console.log(minValue);
        // const radius = 200;


        const center = [svgDimention.width / 2, svgDimention.height / 2];
        const angleSlice2 = Math.PI * 2 / data.length;

        const coords = data.map((d, i) => {
            const normalized = (d - minValue) / (maxValue - minValue);
            const r = normalized * radius;
            const angle = i * angleSlice2 - Math.PI / 2;
            return [center[0] + r * Math.cos(angle), center[1] + r * Math.sin(angle)];
        });

        console.log(coords);

        const coordsClosed = [...coords, coords[0]];
        // console.log(coordsClosed);

        var color = "#D4C8BE";

        // 
        // #C7C7BB

        const path = svg.append("path")
            .datum(coordsClosed)
            .attr("d", d3.line())
            .style("fill", color)
            .style("stroke", "#3D405B")
            .style("stroke-width", "2px")
            .style("opacity", 0.8)
            .on("mouseover", function () {
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "5px")
                    .style("opacity", 1.0);

                // const spending = data[i];
                // console.log(spending);

            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "2px")
                    .style("opacity", 0.8);
            });

        // const tooltip = d3.select("body").append("div")
        // .attr("class", "tooltip")
        // .style("opacity", 0);

        // const points = svg.selectAll(".point")
        // .data(coords)
        // .enter()
        // .append("circle")
        // .attr("class", "point")
        // .attr("cx", d => d[0])
        // .attr("cy", d => d[1])
        // .attr("r", 5)
        // .style("fill", "red")
        // .on("mouseover", (d, i) => {
        //     tooltip.transition()
        //     .duration(200)
        //     .style("opacity", .9);
        //     tooltip.html(`Value: ${coordsClosed[i]}`)
        //     .style("left", (d3.event.pageX + 10) + "px")
        //     .style("top", (d3.event.pageY - 28) + "px");
        // })
        // .on("mouseout", (d) => {
        //     tooltip.transition()
        //     .duration(500)
        //     .style("opacity", 0);
        // });

    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg id="radar_svg" width={svgDimention.width} height={svgDimention.height} ></svg>
        </div>
    );
}

export default Radar;
