import { useEffect, useRef, useContext } from "react";
import { select, scaleLinear, scaleBand } from "d3";
import * as d3 from "d3";
import { EarningsAndVisitorsContext } from "../context";

function BarGraph() {
  var margin = { top: 20, right: 30, bottom: 80, left: 30 };
  let data = [];
  var x, y, svg, g;
  var width = 800;
  var height = 400;

  const earningsAndVisitorContext = useContext(EarningsAndVisitorsContext);
  const originalData = earningsAndVisitorContext.visitorsAndEarnings;

  const svgRef = useRef();

  data = Object.entries(originalData).map(([hour, { participants }]) => {
    let displayHour;
    if (hour == 0) {
      displayHour = "12 AM";
    } else if (hour > 12) {
      displayHour = (hour % 12) + " PM";
    } else if (hour < 12) {
      displayHour = hour + " AM";
    } else {
      displayHour = hour + " PM";
    }

    return {
      hour: displayHour,
      totalParticipants: participants.length,
    };
  });

  useEffect(() => {
    svg = select(svgRef.current).attr("width", width).attr("height", height);
    calculateSVGDimentions();
    drawLineGraph();
    drawBarGraph();
  }, []);

  function drawBarGraph() {
    const tooltip = d3
      .select("body")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("font-size", "10px")
      .style("padding", "8px")
      .style("position", "absolute")
      .style("left", `${80}px`)
      .style("top", `${80}px`);

    x = scaleBand()
      .domain(data.map(({ hour }) => hour))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    y = scaleLinear()
      .domain([
        0,
        Math.max(...data.map(({ totalParticipants }) => totalParticipants)),
      ])
      .range([height - margin.bottom, margin.top]);

    g = svg.select("g");

    g.append("text")
      .attr(
        "transform",
        `translate(${width / 2}, ${height - margin.bottom + 50})`
      )
      .attr("text-anchor", "middle")
      .text("Time (hour)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2.5)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text("Total Customers");

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", ({ hour }) => {
        return x(hour);
      })
      .attr("y", ({ totalParticipants }) => y(totalParticipants))
      .attr("width", x.bandwidth())
      .attr(
        "height",
        ({ totalParticipants }) => height - y(totalParticipants) - margin.bottom
      )
      .attr("opacity", 0.5)
      .on("mouseover", function (e, d) {
        tooltip
          .html(
            `Time: <I><B> ${d.hour}</B></I><br> Total Customers: <I><B> ${d.totalParticipants}</B></I>`
          )
          .style("opacity", 1)
          .style("position", "absolute")
          .style("left", `${e.clientX + 80}px`)
          .style("top", `${e.clientY + 80}px`);
      })
      .on("mousemove", function (e, d) {
        tooltip
          .style("left", e.clientX + 20 + "px")
          .style("top", e.clientY + 20 + "px");
      })
      .on("mouseleave", function (e, d) {
        tooltip.style("position", "absolute");
        tooltip.style("opacity", 0);
      });

    g.selectAll(".circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("r", "5px")
      .attr("fill", "#69b3a2")
      .attr("cx", ({ hour }) => x(hour) + x.bandwidth() / 2)
      .attr("cy", ({ totalParticipants }) => y(totalParticipants))
      .attr("opacity", 0.5);
  }

  function drawLineGraph() {
    x = scaleBand()
      .domain(data.map(({ hour }) => hour))
      .range([margin.left, width - margin.right]);

    y = scaleLinear()
      .domain([
        0,
        Math.max(...data.map(({ totalParticipants }) => totalParticipants)),
      ])
      .range([height - margin.bottom, margin.top]);

    g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0, ${height - margin.bottom} )`)
      .call(d3.axisBottom(x))
      .call((g) =>
        g
          .selectAll(`.tick text`)
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr(`y`, -1.5)
          .attr(`dx`, -7)
      );

    g.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", `translate(${margin.left}, 0 )`)
      .call(d3.axisLeft(y).ticks(10))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Total Participants");

    g.append("path")
      .attr("class", "mypath")
      .datum(data)
      .attr("fill", "none")
      .attr("opacity", ".8")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", "2px")
      .attr("stroke-linejoin", "round")
      .attr(
        "d",
        d3
          .line()
          .x(({ hour }) => x(hour) + x.bandwidth() / 2)
          .y(({ totalParticipants }) => y(totalParticipants))
      );
  }

  function calculateSVGDimentions() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    width = windowWidth * 0.5;
    height = windowHeight - 200;
    svg.attr("width", width).attr("height", height);
  }

  return (
    <>
      <div className="flex item-center justify-center font::black bold">
        {" "}
        It's Smit Patel{" "}
      </div>
      <div className="flex items-center justify-center overflow-hidden align-center border::1px solid black">
        <svg ref={svgRef} id="bargraph"></svg>
      </div>
    </>
  );
}

export default BarGraph;
