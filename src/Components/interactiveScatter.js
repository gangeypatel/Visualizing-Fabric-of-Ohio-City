import { useEffect, useState, useContext } from "react";
import { ParticipantsContext, DateTimeContext } from "../context";
import axios from "axios";
// import rawJsonData from '../data/interActiveScatterPlot.json'
const activities = [
  "AtHome",
  "Transport",
  "AtRecreation",
  "AtRestaurant",
  "AtWork",
];
const ANIMATION_STEP = 1800;
const RADIUS_CIRCLE = 5;
var myTimer;

function InteractiveScatter() {
  const [svgDimention, setSvgDimention] = useState({
    width: 800,
    height: 650,
  });

  const participantContext = useContext(ParticipantsContext);
  const participants = participantContext.selectedParticipants;
  const dateTimeContext = useContext(DateTimeContext);
  const dateTime = dateTimeContext.dateTime;
  const date = dateTime.split(" ")[0];

  const d3 = window.d3;

  useEffect(() => {
    calculateSVGDimentions();
  }, []);

  useEffect(() => {
    (async () => {
      const rawJsonData = await fetchParticipantConnections(
        makeQuery(date, participants)
      );
      const data = restructureData(rawJsonData);
      drawInteractivePlot(data);
    })();
  }, [participants]);
  // }, []);

  function calculateSVGDimentions() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    setSvgDimention({
      width: windowWidth - 100,
      height: windowHeight - 100,
    });
  }

  function drawInteractivePlot(data) {
    const svg = d3
      .select("#interactive_svg")
      .attr("width", svgDimention.width)
      .attr("height", svgDimention.height);
    const RADIUS = svgDimention.height / 2.5;
    const circle = svg
      .append("circle")
      .attr("cx", svgDimention.width / 2)
      .attr("cy", svgDimention.height / 2)
      .attr("r", RADIUS / 1.05)
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", "3px")
      .style("opacity", 0.75);

    const theta = d3
      .scaleBand()
      .range([0, 2 * Math.PI])
      .align(0)
      .domain(activities);

    const color = d3
      .scaleOrdinal()
      .range(["violet", "blue", "green", "yellow", "red"])
      .domain(activities);

    const labels = svg
      .selectAll("mylabels")
      .data(activities)
      .join("text")
      .text((d) => d)
      .style("text-anchor", (d) => {
        const angle = (theta(d) * 180) / Math.PI;
        if (angle > 90 && angle < 270) {
          return "start";
        } else {
          return "end";
        }
      })
      .attr("transform", (d) => {
        const angle = (theta(d) * 180) / Math.PI;
        if (angle > 90 && angle < 270) {
          return `translate(${
            svgDimention.width / 2 +
            (RADIUS + RADIUS / 5) * Math.cos(theta(d)) * 0.98
          }, ${
            svgDimention.height / 2 +
            (RADIUS + RADIUS / 7) * Math.sin(theta(d)) * 0.98
          })`;
        } else {
          return `translate(${
            svgDimention.width / 2 +
            (RADIUS + RADIUS / 5) * Math.cos(theta(d)) * 0.98
          }, ${
            svgDimention.height / 2 +
            (RADIUS + RADIUS / 7) * Math.sin(theta(d)) * 0.98
          })`;
        }
      })
      .style("font-size", 14);

    const simulation = d3
      .forceSimulation(data)
      .force("collision", d3.forceCollide().radius(7).strength(0.25)) // Add collision force to prevent overlap
      .force(
        "x",
        d3
          .forceX()
          .strength(0.1)
          .x(
            (d) =>
              svgDimention.width / 2 +
              (RADIUS + RADIUS / 5) * Math.cos(theta(d.currentmode)) * 0.75
          )
      ) // Add x-axis centering force
      .force(
        "y",
        d3
          .forceY()
          .strength(0.1)
          .y(
            (d) =>
              svgDimention.height / 2 +
              (RADIUS + RADIUS / 7) * Math.sin(theta(d.currentmode)) * 0.75
          )
      ) // Add y-axis centering force
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.currentmode)
          .distance(50)
          .strength(1)
      );

    playAnimation();
    function playAnimation() {
      var index = 0;
      clearInterval(myTimer);
      myTimer = setInterval(function () {
        const manipulatedData = positionManupilation(data[index]);
        drawInteractivePlotUtil(manipulatedData);
        index = (index + 1) % data.length;
      }, ANIMATION_STEP);
    }

    function drawInteractivePlotUtil(data) {
      const nodes = svg.selectAll(".nodes").data(data);
      nodes.join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", (d) => {
              return d.x;
            })
            .attr("cy", (d) => {
              return d.y;
            })
            .attr("r", "5")
            .style("fill", (d) => color(d.currentmode))
            .attr("stroke", "white")
            .attr("class", "nodes"),

        (update) =>
          update
            .transition()
            .duration(750)
            .attr("cx", (d) => {
              return d.x;
            })
            .attr("cy", (d) => {
              return d.y;
            })
            .attr("r", "5")
            .style("fill", (d) => color(d.currentmode))
            .attr("stroke", "white")
            .attr("class", "nodes"),

        (exit) => exit.remove()
      );
    }

    function positionManupilation(data) {
      const activityCounter = categoryCounter(data);
      const circularCoords = [];
      activityCounter.map(function (count, index) {
        circularCoords.push(
          formCircleAroundCenter(
            count,
            svgDimention.width / 2 +
              (RADIUS - RADIUS / 7) * Math.cos(theta(activities[index])),
            svgDimention.height / 2 +
              (RADIUS - RADIUS / 7) * Math.sin(theta(activities[index])),
            RADIUS_CIRCLE
          )
        );
      });

      var pointer = new Array(activities.length).fill(0);
      data.forEach((point) => {
        const index = activities.indexOf(point["currentmode"]);
        point["x"] = circularCoords[index][pointer[index]]["x"];
        point["y"] = circularCoords[index][pointer[index]]["y"];
        pointer[index] += 1;
      });
      return data;
    }
  }

  function formCircleAroundCenter(numberOfNodes, x, y, radius) {
    const coord = [{ x: x, y: y }];
    var layer = 1;
    var angleDiff = Math.PI / 3;
    numberOfNodes -= 1;
    while (numberOfNodes > 0) {
      for (var i = 0; i < 2 * Math.PI; i += angleDiff) {
        if (numberOfNodes >= 0) {
          coord.push({
            x: x + layer * 2 * radius * Math.cos(i),
            y: y + layer * 2 * radius * Math.sin(i),
          });
          numberOfNodes -= 1;
        }
      }
      layer += 1;
      angleDiff /= 2;
    }

    return coord;
  }

  function categoryCounter(data) {
    var count = [];
    activities.forEach((activity) => {
      var cnt = 0;
      data.forEach((elem) => {
        if (elem["currentmode"] == activity) {
          cnt += 1;
        }
      });
      count.push(cnt);
    });
    return count;
  }

  function makeQuery(date, participants) {
    let query = date;
    participants.forEach((participant) => {
      query += "&" + participant.participantid;
    });

    return query;
  }

  function restructureData(data) {
    data.forEach((row) => {
      row.forEach((elem) => {
        elem["x"] = 0;
        elem["y"] = 0;
      });
    });
    return data;
  }

  async function fetchParticipantConnections(query) {
    return await axios
      .get("http://127.0.0.1:8002/activity/" + query, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((d) => {
        return d.data;
      })
      .catch((e) => {
        console.log(e.message);
        return [];
      });
  }

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <svg
        id="interactive_svg"
        width={svgDimention.width}
        height={svgDimention.height}
      ></svg>
    </div>
  );
}

export default InteractiveScatter;
