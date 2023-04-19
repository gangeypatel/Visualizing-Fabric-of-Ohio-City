import { useEffect, useState, useContext } from "react";
import { ParticipantsContext, DateContext } from "../context";
import axios from "axios";
// import rawJsonData from '../data/chordDiagram.json'

function Chord() {
    console.log()
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
            drawChordChart(data);
        })()

    }, [participants]);

    async function fetchParticipantConnections(query){
        return await axios.get("http://127.0.0.1:8002/social_network/"+ query, {
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

    function drawChordChart(data) {
        const svg = d3.select("#chord_svg").attr("width", svgDimention.width).attr("height", svgDimention.height);
        const RADIUS = svgDimention.height/2.5;
        const allNodes = data.nodes.map(d => d.name)

        const theta = d3.scaleBand()
                    .range([0, 2 * Math.PI])
                    .align(0)
                    .domain(allNodes);

        const idToNode = {};
        data.nodes.forEach(function (n) {
            idToNode[n.id] = n;
        });
        console.log(data)
        console.log("svg",svg)
        const links = svg
            .selectAll('mylinks')
            .data(data.links)
            .join('path')
            .attr('d', d => {
                console.log(d);
                var startX = svgDimention.width/2 + RADIUS*Math.cos(theta(idToNode[d.source].name))
                var endX = svgDimention.width/2 + RADIUS*Math.cos(theta(idToNode[d.target].name))
                var startY = svgDimention.height/2 + RADIUS*Math.sin(theta(idToNode[d.source].name))
                var endY = svgDimention.height/2 + RADIUS*Math.sin(theta(idToNode[d.target].name))
                return ['M', startX, startY,
                    'A',
                    RADIUS, ',',
                    RADIUS, 0, 0, ',',
                    0, endX, ',', endY]
                    .join(' ');
            })
            .style("fill", "none")
            .attr("stroke", "grey")
            .style("stroke-width", 1)
            .style('opacity', 1);

        const nodes = svg
            .selectAll("mynodes")
            .data(data.nodes.sort((a,b) => {return +b.n - +a.n }))
            .join("circle")
            .attr("cx", d=>{return svgDimention.width/2 + RADIUS*Math.cos(theta(d.name))})
            .attr("cy", d=>{return svgDimention.height/2 + RADIUS*Math.sin(theta(d.name))})
            .attr("r", "5")
            .style("fill", "green")
            .attr("stroke", "white")

        const labels = svg
            .selectAll("mylabels")
            .data(data.nodes.sort((a,b) => {return +b.n - +a.n }))
            .join("text")
            .text(d=>d.name)
            .style("text-anchor", (d) => {
                const angle = theta(d.name) * 180/ Math.PI;
                if(angle > 90 && angle < 270) {
                    return "start";
                } else {
                    return "end";
                }
            })
            .attr("transform",(d) => {
                const angle = theta(d.name) * 180/ Math.PI;
                if(angle > 90 && angle < 270) {
                    return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/7)*Math.cos(theta(d.name))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d.name))}) rotate(${(theta(d.name) * 180/ Math.PI) + 180})`;
                } else {
                    return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/7)*Math.cos(theta(d.name))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d.name))}) rotate(${theta(d.name) * 180/ Math.PI})`;
                }
            })
            .style("font-size", 8)

        nodes
            .on('mouseover', function (d, i) {
                const connections = new Set();
                connections.add(i.name);
                // Links
                links
                    .style('stroke', function (link_d) { 
                        // Find connected nodes
                        if (link_d.source === i.name || link_d.target === i.name) {
                            connections.add(link_d.source);
                            connections.add(link_d.target);
                            return "black";
                        }
                         return "grey";
                    })
                    .style('opacity', function (link_d) { return (link_d.source === i.name || link_d.target === i.name) ? 1 : 0;});
                
                // Highlight selected node and its connections
                const circleSelection = document.getElementsByTagName('circle');
                for(var itr=0; circleSelection[itr]; itr++) {
                    const currentNode = d3.select(circleSelection[itr]);
                    const currentNodeName = currentNode._groups[0][0].__data__['name'];
                    if(connections.has(currentNodeName)) {
                        currentNode.style('opacity', 1);
                    } else {
                        currentNode.style('opacity', 0.2);
                    }
                }
                // Labels
                labels
                    .style("font-size", function(label_d){ return connections.has(label_d.name) ? 15 : 2 } )
                    .attr("transform",(d)=> {
                        const angle = theta(d.name) * 180/ Math.PI;
                        if(angle > 90 && angle < 270) {
                            return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/5)*Math.cos(theta(d.name))}, ${svgDimention.height/2 + (RADIUS+RADIUS/5)*Math.sin(theta(d.name))}) rotate(${(theta(d.name) * 180/ Math.PI) + 180})`;
                        } else {
                            return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/5)*Math.cos(theta(d.name))}, ${svgDimention.height/2 + (RADIUS+RADIUS/5)*Math.sin(theta(d.name))}) rotate(${theta(d.name) * 180/ Math.PI})`;
                        }
                    })
            })
            .on('mouseout', function (d) {
                nodes.style('opacity', 1)
                links
                    .style('stroke', 'grey')
                    .style('opacity', 1)
                labels
                    .style("font-size", 8 )
                    .attr("transform",(d)=> {
                        const angle = theta(d.name) * 180/ Math.PI;
                        if(angle > 90 && angle < 270) {
                            return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/7)*Math.cos(theta(d.name))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d.name))}) rotate(${(theta(d.name) * 180/ Math.PI) + 180})`;
                        } else {
                            return `translate(${svgDimention.width/2 + (RADIUS+RADIUS/7)*Math.cos(theta(d.name))}, ${svgDimention.height/2 + (RADIUS+RADIUS/7)*Math.sin(theta(d.name))}) rotate(${theta(d.name) * 180/ Math.PI})`;
                        }
                    })
            });
    }

    function makeQuery(date, participants) {
        let query = date;
        participants.forEach(participant => {
            query += "&" + participant.participantid;
        });

        return query;
    }

    function restructureData(rawJsonData) {
    
        const distinctNodes = new Set();
        const tempDict = {
            'links': [],
            'nodes': []
        }
        rawJsonData.forEach(data => {

            tempDict['links'].push({"source": data['participantidfrom'], "target": data['participantidto'], "value": 1})
            if (!(distinctNodes.has(data['participantidfrom']))) {
                distinctNodes.add(data['participantidfrom']);
                tempDict['nodes'].push({"name": data['participantidfrom'], "id": data['participantidfrom']});
            }
            if (!(distinctNodes.has(data['participantidto']))) {
                distinctNodes.add(data['participantidto']);
                tempDict['nodes'].push({"name": data['participantidto'], "id": data['participantidto']});
            }
        });

        return tempDict;
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg id="chord_svg" width={svgDimention.width} height={svgDimention.height} ></svg>
        </div>
    );
}

export default Chord;
