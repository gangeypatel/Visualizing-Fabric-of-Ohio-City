import axios from "axios";
import { useContext, useEffect, useState } from "react";
import {
  BuildingContext,
  DateTimeContext,
  EarningsAndVisitorsContext,
} from "../context";

function Circular() {
  const d3 = window.d3;

  const [svgDimention, setSvgDimention] = useState({
    width: null,
    height: null,
  });

  let svg;

  const buildingContext = useContext(BuildingContext);
  const data = buildingContext.selectedBuildings;

  const dateTimeContext = useContext(DateTimeContext);
  const dateTime = dateTimeContext.dateTime;
  const date = dateTime.split(" ")[0];

  const earningsAndVisitorContext = useContext(EarningsAndVisitorsContext);

  const color = d3
    .scaleOrdinal()
    .domain([1, 2, 3])
    .range(["#bee9e8", "#cae9ff", "#5fa8d3"]);

  const size = d3.scaleLinear().domain([0, 200]).range([15, 40]);

  const x = d3.scaleOrdinal().domain([1, 2, 3]).range([50, 200, 340]);

  useEffect(() => {
    calculateSVGDimentions();
  }, []);

  useEffect(() => {
    if (
      typeof svgDimention.width !== "number" ||
      typeof svgDimention.height !== "number"
    )
      return;
    svg = d3
      .select("svg#circular_svg")
      .attr("width", svgDimention.width)
      .attr("height", svgDimention.height);

    drawcircularmap();
  }, [data, svgDimention]);

  function drawcircularmap() {
    svg.selectAll("*").remove();

    const node = svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("id", "circles")
      .attr("r", function (d) {
        return size(parseInt(d.maxOccupancy));
      })
      .attr("cx", svgDimention.width / 2)
      .attr("cy", svgDimention.height / 2)
      .style("fill", function (d) {
        return color(d.businessType);
      })
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 4)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", function (d, i) {
        fetchBusinessData(i.businessId);
      });

    async function fetchBusinessData(businessId) {
      const result = await axios
        .get("http://127.0.0.1:8002/barchart/" + date + "&" + businessId)
        .then((d) => {
          return d.data;
        });
      earningsAndVisitorContext.setVisitorsAndEarnings(result);
      console.log(result);
    }

    var simulation = d3
      .forceSimulation()
      .force(
        "x",
        d3
          .forceX()
          .strength(0.1)
          .x(function (d) {
            return x(svgDimention.width / 2);
          })
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.1)
          .y(svgDimention.width / 2)
      )
      .force(
        "center",
        d3
          .forceCenter()
          .x(svgDimention.width / 2)
          .y(svgDimention.height / 2)
      )
      .force("charge", d3.forceManyBody().strength(0.1))
      .force(
        "collide",
        d3
          .forceCollide()
          .strength(0.2)
          .radius(function (d) {
            return size(d["maxOccupancy"] * 1.5);
          })
          .iterations(1)
      );

    simulation.nodes(data).on("tick", function (d) {
      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0.03);
      d.fx = null;
      d.fy = null;
    }
  }

  function calculateSVGDimentions() {
    if (!svg || svg.node() === null) svg = d3.select("#circular_svg");
    const margin = 0;
    const dimentions = svg.node().parentNode.getBoundingClientRect();
    const parentHeight = dimentions.height - margin;
    const parentWidth = dimentions.width - margin;

    setSvgDimention({
      width: parentWidth,
      height: parentHeight,
    });
  }

  return (
    <svg
      id="circular_svg"
      width={svgDimention.width}
      height={svgDimention.height}
    ></svg>
  );
}

export default Circular;
