import { csv,json } from "d3";

export const getCSVdata = (csvFileArray) =>{
    const promises = [];
    csvFileArray.forEach((csvFile) => {
        promises.push(csv(csvFile));
    });
    return Promise.all(promises);
}