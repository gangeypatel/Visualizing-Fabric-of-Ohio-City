import { useEffect, useState } from "react";
import rawJsonData from '../data/chordDiagram.json'


function Chord() {
    const [svgDimention, setSvgDimention] = useState({
        width: 800,
        height: 650
    })

    const d3 = window.d3;
    const svg = d3.select("#chord_svg").attr("width", svgDimention.width).attr("height", svgDimention.height);

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

        // svg.attr("width", svgDimention.width).attr("height", svgDimention.height);
    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <svg id="chord_svg" width={svgDimention.width} height={svgDimention.height} ></svg>
        </div>
    );
}

export default Chord;
