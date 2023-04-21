import { useEffect, useState, useContext } from "react";
import { ParticipantsContext, DateContext } from "../context";
import axios from "axios";
const activities = ["AtHome", "Transport", "AtRecreation", "AtRestaurant", "AtWork"];
const ANIMATION_STEP = 1000;
const RADIUS_CIRCLE = 5;
var myTimer;

function InteractiveScatter() {
    const [svgDimention, setSvgDimention] = useState({
        width: 800,
        height: 650
    })

    const participantContext = useContext(ParticipantsContext)
    const participants = participantContext.selectedParticipants
    const dateContext = useContext(DateContext)
    const date = dateContext.date

    const d3 = window.d3;

    useEffect(() => {
        calculateSVGDimentions();
    }, []);

    useEffect(() => {
        (async () => {
            const rawJsonData = await fetchParticipantConnections(makeQuery(date, participants));
            const data = restructureData(rawJsonData);
            drawInteractivePlot(data);
        })()

    }, [participants]);

    async function fetchParticipantConnections(query){
        return await axios.get("http://127.0.0.1:8002/activity/"+ query, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            })
            .then((d) => {
                return d.data;
            }).catch((e) => {
                console.log(e.message)
                return [];
            })
    }

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setSvgDimention({
            width: windowWidth - 100,
            height: windowHeight - 100
        })
    }

    function drawInteractivePlot(data) {
        const svg = d3.select("#interactive_svg").attr("width", svgDimention.width).attr("height", svgDimention.height);
        const RADIUS = svgDimention.height/2.5;

        const theta = d3.scaleBand()
                    .range([0, 2 * Math.PI])
                    .align(0)
                    .domain(activities);

        const color = d3.scaleOrdinal()
                        .range(["violet", "blue", "green", "yellow", "red"])
                        .domain(activities);

        const labels = svg
                        .selectAll("mylabels")
                        .data(activities)
                        .join("text")
                        .text(d=>d)
                        .style("text-anchor", (d) => {
                            const angle = theta(d) * 180/ Math.PI;
                            if(angle > 90 && angle < 270) {
                                return "start";
                            } else {
                                return "end";
                            }
                        })
                        .attr("transform",(d) => {
                            const angle = theta(d) * 180/ Math.PI;
                            if(angle > 90 && angle < 270) {
                                return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/5)*Math.cos(theta(d))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d))}) rotate(${(theta(d) * 180/ Math.PI) + 180})`;
                            } else {
                                return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/5)*Math.cos(theta(d))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d))}) rotate(${theta(d) * 180/ Math.PI})`;
                            }
                        })
                        .style("font-size", 14)

        playAnimation();
        function playAnimation() {
            var index = 0;
            clearInterval (myTimer);
            myTimer = setInterval (function() {
                const manipulatedData = positionManupilation(data[index]);
                drawInteractivePlotUtil(manipulatedData);
                index = (index + 1)%(data.length);
            }, ANIMATION_STEP);
        };

        function drawInteractivePlotUtil(data) {
            const nodes = svg.selectAll(".nodes").data(data);
            nodes.join(
                enter => enter.append("circle")
                                .attr("cx", d=>{return d.x})
                                .attr("cy", d=>{return d.y})
                                .attr("r", "5")
                                .style("fill", (d) => color(d.currentmode))
                                .attr("stroke", "white")
                                .attr("class", "nodes"),

                update => update.transition().duration(750)
                                .attr("cx", d=>{return d.x})
                                .attr("cy", d=>{return d.y})
                                .attr("r", "5")
                                .style("fill", (d) => color(d.currentmode))
                                .attr("stroke", "white")
                                .attr("class", "nodes"),

                exit => exit.remove()
            );
        }

        function positionManupilation(data) {
            const activityCounter = categoryCounter(data);
            const circularCoords = [];
            activityCounter.map(function(count, index) {
                circularCoords.push(formCircleAroundCenter(count, 
                    svgDimention.width/2 + (RADIUS - RADIUS/7)*Math.cos(theta(activities[index])), 
                    svgDimention.height/2 + (RADIUS - RADIUS/7)*Math.sin(theta(activities[index])), 
                    RADIUS_CIRCLE));
            });
    
            var pointer = new Array(activities.length).fill(0);
            data.forEach(point => {
                const index = activities.indexOf(point["currentmode"]);
                point["x"] = circularCoords[index][pointer[index]]["x"];
                point["y"] = circularCoords[index][pointer[index]]["y"];
                pointer[index] += 1;
            });
            return data;
        }
    }

    function formCircleAroundCenter(numberOfNodes, x, y, radius) {
        const coord = [{"x":x, "y": y}];
        var layer = 1;
        var angleDiff = Math.PI/3;
        numberOfNodes -= 1;
        while(numberOfNodes > 0) {
            for(var i=0; i<2*Math.PI; i += angleDiff) {
                if(numberOfNodes >= 0) {
                    coord.push({"x": x + (layer*2)*radius*Math.cos(i), "y":y + (layer*2)*radius*Math.sin(i)});
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
        activities.forEach(activity => {
            var cnt = 0;
            data.forEach(elem => {
                if(elem["currentmode"] == activity) {
                    cnt += 1;
                }
            });
            count.push(cnt);
        });
        return count;
    }

    function makeQuery(date, participants) {
        let query = date;
        participants.forEach(participant => {
            query += "&" + participant.participantid;
        });

        return query;
    }

    function restructureData(data) {
        data.forEach(row => {
            row.forEach(elem => {
                elem["x"] = 0;
                elem["y"] = 0;
            });
        });
        return data;
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg id="interactive_svg" width={svgDimention.width} height={svgDimention.height} ></svg>
        </div>
    );
}

export default InteractiveScatter;
