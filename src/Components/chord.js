import { lab } from "d3";
import { useEffect, useState } from "react";
import rawJsonData from '../data/chordDiagram.json'
// const numberOfParticipants = 1011;
// const adjMatrix = [];
// const adjMatrix = [
//     // [ 0, 0, 0, 0],
//     [ 0, 0, 1, 1],
//     [ 0, 1, 0, 1],
//     [ 0, 1, 1, 0]
//   ];

function Chord() {
    const [svgDimention, setSvgDimention] = useState({
        width: 800,
        height: 650
    })

    const [nodeLinkDictionary,setNodeLinkDictionary] = useState({
        'nodes': [],
        'links': []
    })

    const d3 = window.d3;
    const svg = d3.select("#chord_svg").attr("width", svgDimention.width).attr("height", svgDimention.height);
    useEffect(() => {
        restructureData();
        calculateSVGDimentions();
    }, []);

    useEffect(() => {
        drawChordChart();
    },[nodeLinkDictionary])

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setSvgDimention({
            width: windowWidth - 100,
            height: windowHeight - 100
        })
    }

    function drawChordChart() {

        const RADIUS = svgDimention.height/4;
        const data = nodeLinkDictionary;
        const allNodes = data.nodes.map(d => d.name)

        const theta = d3.scaleBand()
                    .range([0, 2 * Math.PI])
                    .align(0)
                    .domain(allNodes);

        const idToNode = {};
        data.nodes.forEach(function (n) {
            idToNode[n.id] = n;
        });

        const links = svg
            .selectAll('mylinks')
            .data(data.links)
            .join('path')
            .attr('d', d => {
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
            .attr("x", d=>{return svgDimention.width/2 + (RADIUS+RADIUS/10)*Math.cos(theta(d.name))})
            .attr("y", d=>{return svgDimention.height/2 + (RADIUS+RADIUS/10)*Math.sin(theta(d.name))})
            .text(d=>d.name)
            .style("text-anchor", "end")
            // .attr("transform",d=>`rotate(${theta(d.name) * 180/ Math.PI})`)
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
                    .attr("y", function(label_d){ 
                        // if(label_d.name === i.name) 
                        if(connections.has(label_d.name)) {
                            return  svgDimention.height/2 + (RADIUS+RADIUS/5)*Math.sin(theta(label_d.name));
                        }
                    })
                    .attr("x", function(label_d) {
                        if(connections.has(label_d.name))
                            return svgDimention.width/2 + (RADIUS+RADIUS/5)*Math.cos(theta(label_d.name));
                    })
            })
            .on('mouseout', function (d) {
                nodes.style('opacity', 1)
                links
                    .style('stroke', 'grey')
                    .style('opacity', 1)
                labels
                    .style("font-size", 8 )
                    .attr("y", function(label_d){ 
                            return  svgDimention.height/2 + (RADIUS+RADIUS/10)*Math.sin(theta(label_d.name));
                    })
                    .attr("x", function(label_d) {
                            return svgDimention.width/2 + (RADIUS+RADIUS/10)*Math.cos(theta(label_d.name));
                    })
            });
    }

    // function createAdjacencyMatrix() {
    //     const nodeDictionary = {};
    //     rawJsonData.forEach(data => {
    //         if(data['participantidfrom'] in nodeDictionary) {
    //             nodeDictionary[data['participantidfrom']].push(parseInt(data['participantidto']));
    //         } else {
    //             nodeDictionary[data['participantidfrom']] = [];
    //             nodeDictionary[data['participantidfrom']].push(parseInt(data['participantidto']));
    //         }
    //     });
    //     console.log(nodeDictionary);
    //     for(var participantId = 0; participantId < numberOfParticipants; participantId++) {
    //         if(participantId in nodeDictionary) {
    //             var currentAdj = new Array(numberOfParticipants).fill(0);
    //             for(var i=0; i<numberOfParticipants; i++) {
    //                 if(i in nodeDictionary[participantId]) {
    //                     currentAdj[i] = 1;
    //                 }
    //             }
    //             adjMatrix.push(currentAdj);
    //         }
    //         // else
    //         //     adjMatrix.push(new Array(numberOfParticipants).fill(0));
    //     }
    // }

    function restructureData() {
    
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

        setNodeLinkDictionary(tempDict)
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg id="chord_svg" width={svgDimention.width} height={svgDimention.height} ></svg>
        </div>
    );
}

export default Chord;
