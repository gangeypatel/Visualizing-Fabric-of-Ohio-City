import { useEffect, useState, useContext } from "react";
// import { ParticipantsContext, DateContext } from "../context";
import axios from "axios";
import rawJsonData from '../data/chordDiagram.json'

function Radar() {
    console.log("RADAR CALLED");
    const [svgDimention, setSvgDimention] = useState({
        width: 800,
        height: 650
    })

    const d3 = window.d3;

    useEffect(() => {
        calculateSVGDimentions();
    }, []);

    function calculateSVGDimentions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setSvgDimention({
            width: windowWidth - 100,
            height: windowHeight - 100
        })
    }

    function drawChordChart(data) {
        const svg = d3.select("#radar_svg").attr("width", svgDimention.width).attr("height", svgDimention.height);
    
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg id="radar_svg" width={svgDimention.width} height={svgDimention.height} ></svg>
        </div>
    );
}

export default Radar;
