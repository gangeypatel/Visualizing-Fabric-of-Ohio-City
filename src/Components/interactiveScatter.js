import { useEffect, useState, useContext } from "react";
import { ParticipantsContext, DateContext } from "../context";
import axios from "axios";
import rawJsonData from '../data/chordDiagram.json'
const activities = ["AtHome", "Transport", "AtRecreation", "AtRestaurant", "AtWork"];
const ANIMATION_STEP = 1000;
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
            // const data = restructureData(rawJsonData);
            console.log(rawJsonData);
            drawInteractivePlot(rawJsonData);
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
                            const angle = theta(d.name) * 180/ Math.PI;
                            if(angle > 90 && angle < 270) {
                                return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/7)*Math.cos(theta(d))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d))}) rotate(${(theta(d) * 180/ Math.PI) + 180})`;
                            } else {
                                return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/7)*Math.cos(theta(d))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d))}) rotate(${theta(d) * 180/ Math.PI})`;
                            }
                        })
                        .style("font-size", 14)

        playAnimation();
        var index = 0;
        function playAnimation() {
            clearInterval (myTimer);
            myTimer = setInterval (function() {
                drawInteractivePlotUtil(data[index]);
                index = (index + 1)%(data.length);
            }, ANIMATION_STEP);
        };

        function drawInteractivePlotUtil(data) {
            const nodes = svg.selectAll(".nodes").data(data);
            nodes.join(
                enter => enter.append("circle")
                                .attr("cx", d=>{return svgDimention.width/2 + RADIUS*Math.cos(theta(d.currentmode))})
                                .attr("cy", d=>{return svgDimention.height/2 + RADIUS*Math.sin(theta(d.currentmode))})
                                .attr("r", "5")
                                .style("fill", (d) => color(d.currentmode))
                                .attr("stroke", "white")
                                .attr("class", "nodes"),

                update => update.transition().duration(750)
                                .attr("cx", d=>{return svgDimention.width/2 + RADIUS*Math.cos(theta(d.currentmode))})
                                .attr("cy", d=>{return svgDimention.height/2 + RADIUS*Math.sin(theta(d.currentmode))})
                                .attr("r", "5")
                                .style("fill", (d) => color(d.currentmode))
                                .attr("stroke", "white")
                                .attr("class", "nodes"),

                exit => exit.remove()
            );
        }
    }

    

    function makeQuery(date, participants) {
        let query = date;
        participants.forEach(participant => {
            query += "&" + participant.participantid;
        });

        return query;
    }


    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg id="interactive_svg" width={svgDimention.width} height={svgDimention.height} ></svg>
        </div>
    );
}

export default InteractiveScatter;
