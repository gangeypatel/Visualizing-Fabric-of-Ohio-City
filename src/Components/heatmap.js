import { useEffect, useState } from "react";

import imgLocation from '../img/BaseMap.png';
import rawBaseMapVectorPoints from '../data/merged_points_10000.json';
import rawParticipantsLocation from '../data/participants.json';
import rawBuildingLocation from '../data/buildings.csv';

function Heatmap() {
    let d3Lasso;

    const [geoJSONdata, setGeoJSONdata] = useState(rawBaseMapVectorPoints);
    const [participantsLocation, setParticipantsLocation] = useState([]);
    const [buildingsLocation, setBuildingsLocation] = useState([]);
    const [availablebalance, setAvailablebalance] = useState({
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE
    });
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

    let width = 800, height = 650;
    const imageWidth = 1076;
    const imageHeight = 1144;
    const pointsRadius = 3;

    const d3 = window.d3;
    const svg = d3.select("svg").attr("width", width).attr("height", height);

    let zoom;

    useEffect(() => {
        (async () => {
            await modifyLocations();
        })();
        addEventListener();
    }, []);

    useEffect(() => {
        calculateSVGDimentions();
        drawBaseImageMap();
        // drawBaseMapPoints();
        drawBuildingLocation();
        drawParticipantsLocation();
        initLasso();
    }, [participantsLocation]);

    async function modifyLocations() {
        let maxAvailablebalance = 0, minAvailablebalance = Number.MAX_VALUE;
        let modifiedParticipantsLocation = rawParticipantsLocation.map(d => {
            const locationPointString = d.currentlocation;
            const locationPointSplitted = locationPointString.split(" ");
            const x = parseFloat(locationPointSplitted[1].slice(1, -1));
            const y = parseFloat(locationPointSplitted[2].slice(0, -1));
            if (d.availablebalance > maxAvailablebalance) {
                maxAvailablebalance = d.availablebalance;
            }
            if (d.availablebalance < minAvailablebalance) {
                minAvailablebalance = d.availablebalance;
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

        const imageDimentionScaleX = d3.scaleLinear()
            .domain([participantsMinMax.x.min, participantsMinMax.x.max])
            .range([0, imageWidth]);

        const imageDimentionScaleY = d3.scaleLinear()
            .domain([participantsMinMax.y.min, participantsMinMax.y.max])
            .range([imageHeight, 0]);


        modifiedParticipantsLocation = modifiedParticipantsLocation.map(d => ({
            ...d,
            x: imageDimentionScaleX(d.x),
            y: imageDimentionScaleY(d.y)
        }));

        const rawBuildingLocationData = await d3.csv(rawBuildingLocation);
        
        const db = []
        const modifiedBuildingLocation = rawBuildingLocationData.map(d => {
            // d.location = POLYGON ((400.41017008252567 4426.631523990375, 400.6737114714055 4466.630655805157, 495.0955925249795 4466.008540460536, 494.83205113609966 4426.009408645754, 400.41017008252567 4426.631523990375))
            // find centroid of polygon
            const locationPointString = d.location;
            const locationPointSplitted = locationPointString.split(" ");
            // console.log(locationPointSplitted);
            const x = parseFloat(locationPointSplitted[1].slice(2, -1));
            const y = parseFloat(locationPointSplitted[2].slice(0, -1));

            return {
                ...d,
                x: imageDimentionScaleX(x),
                y: imageDimentionScaleY(y)
            }
        });

        setBuildingsLocation(modifiedBuildingLocation);

        setParticipantsLocation(modifiedParticipantsLocation);
    }

    function drawBaseImageMap() {
        svg.select("#base_map").remove();
        svg.append("image")
            .attr("id", "base_map")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("xlink:href", imgLocation)
    }

    function drawBaseMapPoints() {
        if (!svg) return;

        const imageScaleX = d3.scaleLinear()
            .domain([0, imageWidth])
            .range([0, width]);
        const imageScaleY = d3.scaleLinear()
            .domain([0, imageHeight])
            .range([0, height]);

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
            .range([pointsRadius+10, width-pointsRadius]);
        const imageScaleY = d3.scaleLinear()
            .domain([0, imageHeight])
            .range([pointsRadius, height-pointsRadius-8]);

        const heatMapColorScale =d3.scaleSequential()
        .interpolator(d3.interpolateHcl("#fafa6e", "#2A4858"))
            .domain([availablebalance.max, availablebalance.min])
        
        const sizeScale = d3.scaleLinear()
            .domain([availablebalance.min, availablebalance.max])
            .range([pointsRadius*0.2, pointsRadius*1]);

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
            .range([pointsRadius+10, width-pointsRadius]);
        const imageScaleY = d3.scaleLinear()
            .domain([0, imageHeight])
            .range([pointsRadius, height-pointsRadius-8]);

        svg.selectAll("circle.building").remove();

        svg.selectAll("circle.building")
            .data(buildingsLocation)
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

    function handleZooming(e) {
        svg.select("image").attr("transform", e.transform)
        svg.selectAll("circle")
            .attr("transform", e.transform)
    }

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        width = windowWidth - 100;
        height = windowHeight - 100;

        const svgWidthBasedOnImage = (height) * (imageWidth / imageHeight);
        width = svgWidthBasedOnImage;

        svg.attr("width", width).attr("height", height);
    }

    function addEventListener() {
        // zoom = d3.zoom()
        //     .scaleExtent([1, 8])
        //     .on("zoom", handleZooming);
        // svg.call(zoom);

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

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg></svg>
        </div>
    );
}

export default Heatmap;
