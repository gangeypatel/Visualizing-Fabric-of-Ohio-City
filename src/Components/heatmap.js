import { useContext, useEffect, useState } from "react";

import imgLocation from '../img/BaseMap.png';
import rawBaseMapVectorPoints from '../data/merged_points_10000.json';
// import rawParticipantsLocation from '../data/participants.json';
import rawBuildingLocation from '../data/buildings.json';
import axios from "axios";
import {ParticipantsContext, BuildingContext, DateContext} from "../context";

function Heatmap() {
    let d3Lasso;

    const [geoJSONdata, setGeoJSONdata] = useState(rawBaseMapVectorPoints);
    const [time,setTime] = useState('17');
    const [participantsLocation, setParticipantsLocation] = useState([]);
    const participantContext = useContext(ParticipantsContext)
    const buildingContext = useContext(BuildingContext)
    const dateContext = useContext(DateContext)
    const date = dateContext.date
    const setDate = dateContext.setDate

    const [availablebalance, setAvailablebalance] = useState({
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE
    });
    const [svgDimention, setSvgDimention] = useState({
        width: 800,
        height: 650
    })

    const participantsMinMax= {
            x: {
                min: -4626,
                max: 2636
            },
            y: {
                min: 37,
                max: 7852
            }
    };

    const imageWidth = 1076;
    const imageHeight = 1144;
    const pointsRadius = 5;

    const d3 = window.d3;
    const svg = d3.select("#heatmap_svg").attr("width", svgDimention.width).attr("height", svgDimention.height);

    const imageDimentionScaleX = d3.scaleLinear()
    .domain([participantsMinMax.x.min, participantsMinMax.x.max])
    .range([0, imageWidth]);
    
    const imageDimentionScaleY = d3.scaleLinear()
    .domain([participantsMinMax.y.min, participantsMinMax.y.max])
    .range([imageHeight, 0]);

    useEffect(() => {
        addEventListener();
        calculateSVGDimentions();
    }, []);

    useEffect(() => {
        (async () => {
            drawBaseImageMap();
            // drawBaseMapPoints();
            drawBuildingLocation();
        })();
    }, [svgDimention]);

    useEffect(() => {
        (async () => {
            const rawParticipantsLocation = await fetchNewParticipantsData();
            await modifyParticipantsData(rawParticipantsLocation);
        })();
    }, [date,time]);

    useEffect(() => {
        drawParticipantsLocation();
        initLasso();
    }, [participantsLocation]);

    async function fetchNewParticipantsData(){
        console.log(date,"adad")
        return await axios.get("http://127.0.0.1:8002/heatmap/"+ date + "&" + time, {
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

    async function modifyParticipantsData(rawParticipantsLocation) {
        let maxAvailablebalance = Number.MIN_VALUE, minAvailablebalance = Number.MAX_VALUE;
        let modifiedParticipantsLocation = rawParticipantsLocation.map(d => {
            const locationPointString = d.currentlocation;
            const locationPointSplitted = locationPointString.split(" ");
            const x = parseFloat(locationPointSplitted[1].slice(1, -1));
            const y = parseFloat(locationPointSplitted[2].slice(0, -1));
            if (+d.availablebalance > maxAvailablebalance) {
                maxAvailablebalance = +d.availablebalance;
            }
            if (+d.availablebalance < minAvailablebalance) {
                minAvailablebalance = +d.availablebalance;
            }

            return {
                ...d,
                availablebalance: parseFloat(d.availablebalance),
                x,
                y
            }
        });

        setAvailablebalance({
            min: minAvailablebalance,
            max: maxAvailablebalance
        });


        modifiedParticipantsLocation = modifiedParticipantsLocation.map(d => ({
            ...d,
            x: imageDimentionScaleX(d.x),
            y: imageDimentionScaleY(d.y)
        }));

        setParticipantsLocation(modifiedParticipantsLocation);
    }

    function drawBaseImageMap() {
        svg.select("#base_map").remove();
        svg.append("image")
            .attr("id", "base_map")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", svgDimention.width)
            .attr("height", svgDimention.height)
            .attr("xlink:href", imgLocation)
    }

    function drawBaseMapPoints() {
        if (!svg) return;

        const imageScaleX = d3.scaleLinear()
            .domain([0, imageWidth])
            .range([0, svgDimention.width]);
        const imageScaleY = d3.scaleLinear()
            .domain([0, imageHeight])
            .range([0, svgDimention.height]);

        svg.selectAll("circle.map_points").remove();
        svg.selectAll("circle.map_points")
            .data(geoJSONdata)
            .enter()
            .append("circle")
            .attr("class", "map_points")
            .attr("cx", d => imageScaleX(d[0]))
            .attr("cy", d => imageScaleY(d[1]))
            .attr("r", pointsRadius)
            .attr("fill", "green")
            .style("opacity", 0.5)
        
    }

    function drawParticipantsLocation() {
        if (!svg) return;
        const imageScaleX = d3.scaleLinear()
            .domain([0, imageWidth])
            .range([pointsRadius+10, svgDimention.width-pointsRadius]);
        const imageScaleY = d3.scaleLinear()
            .domain([0, imageHeight])
            .range([pointsRadius, svgDimention.height-pointsRadius-8]);

        const heatMapColorScale =d3.scaleSequential()
        .interpolator(d3.interpolateHcl("#fafa6e", "#2A4858"))
            .domain([availablebalance.max, availablebalance.min])
        
        const sizeScale = d3.scaleLinear()
            .domain([availablebalance.min, availablebalance.max])
            .range([pointsRadius*0.2, pointsRadius*2]);

        svg.selectAll("circle.participant").remove();

        svg.selectAll("circle.participant")
            .data(participantsLocation)
            .enter()
            .append("circle")
            .attr("class", "participant")
            .attr("cx", d => imageScaleX(d.x))
            .attr("cy", d => imageScaleY(d.y))
            .attr("r", d => sizeScale(d.availablebalance))
            .attr("fill", d => heatMapColorScale(d.availablebalance))
            .attr("stroke", "black")
            .attr("stroke-width", 0.6)
            .style("opacity", 0.5);
    
    }

    function drawBuildingLocation() {
        if (!svg) return;

        const imageScaleX = d3.scaleLinear()
            .domain([0, imageWidth])
            .range([pointsRadius+10, svgDimention.width-pointsRadius]);
        const imageScaleY = d3.scaleLinear()
            .domain([0, imageHeight])
            .range([pointsRadius, svgDimention.height-pointsRadius-8]);

        svg.selectAll("circle.building").remove();

        svg.selectAll("circle.building")
            .data(rawBuildingLocation)
            .enter()
            .append("circle")
            .attr("class", "building")
            .attr("cx", d => imageScaleX(d.x))
            .attr("cy", d => imageScaleY(d.y))
            .attr("r", 2)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("opacity", 0);
    }

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const tempHeight = windowHeight - 100;

        const svgWidthBasedOnImage = (tempHeight) * (imageWidth / imageHeight);
        
        setSvgDimention({
            width: svgWidthBasedOnImage,
            height: tempHeight
        })
    }

    function addEventListener() {
        // window.addEventListener("resize", () => {
        //     calculateSVGDimentions();
        //     // drawBaseImageMap();
        //     // drawBaseMapPoints();
        //     drawParticipantsLocation()
        // });
    }

    function onLassoStart() {
        d3Lasso.items()
        // .attr("r",pointsRadius)
        .classed("not_possible", true).classed("selected", false)
    }

    function onLassoDraw() {
    //     d3Lasso.possibleItems()
    //       .classed("not_possible",false)
    //       .classed("possible",true);
    //   d3Lasso.notPossibleItems()
    //       .classed("not_possible",true)
    //       .classed("possible",false);
    }

    function onLassoEnd() {
        d3Lasso.items()
          .classed("not_possible",false)
          .classed("possible",false);
      d3Lasso.selectedItems()
          .classed("selected", (d,i) => !d.hasOwnProperty("buildingId"));

        const currentSelectedParticipants = [];
        const currentSelectedBuildings = [];

        d3Lasso.selectedItems().data().forEach((d) => {
            if(d.hasOwnProperty("buildingId")) {
                if(d.businessType == "Restaurant" || d.businessType == "Pub")
                    currentSelectedBuildings.push(d)
            }
            else currentSelectedParticipants.push(d)
        })
        console.log(currentSelectedBuildings);
        participantContext.setSelectedParticipants(currentSelectedParticipants)
        buildingContext.setSelectedBuildings(currentSelectedBuildings)
    }

    function initLasso() {
        if(d3Lasso != undefined) return;

        d3Lasso = d3.lasso()
        .closePathDistance(305) 
        .closePathSelect(true) 
        .targetArea(svg)
        .items(svg.selectAll("circle"))
        .on("start",onLassoStart) 
        .on("draw",onLassoDraw) 
        .on("end",onLassoEnd); 

        svg.call(d3Lasso);
    }

    function changeDate(e){
        setDate(e.target.value);
    }

    function changeTime(e){
        setTime(e.target.value)
    }

    return (
        <div className="flex items-center justify-evenly">
            <div className="flex items-center justify-center overflow-hidden">
                <svg id="heatmap_svg" width={svgDimention.width} height={svgDimention.height}></svg>
            </div>
            <div className="flex items-center flex-col">
                <input type={"date"} value={date} onChange={changeDate} />
                <select value={time} onChange={changeTime}>
                    <option>00</option>
                    <option>01</option>
                    <option>02</option>
                    <option>03</option>
                    <option>04</option>
                    <option>05</option>
                    <option>06</option>
                    <option>07</option>
                    <option>08</option>
                    <option>09</option>
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
                    <option>13</option>
                    <option>14</option>
                    <option>15</option>
                    <option>16</option>
                    <option>17</option>
                    <option>18</option>
                    <option>19</option>
                    <option>20</option>
                    <option>21</option>
                    <option>22</option>
                    <option>23</option>
                </select>
            </div>
        </div>
    );
}

export default Heatmap;
