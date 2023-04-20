import Heatmap from "./heatmap";
import {ParticipantsContext, BuildingContext, DateTimeContext, EarningsAndVisitorsContext} from "../context";
import { useState } from "react";
import LeftPanel from "./LeftPanel";
import Typography from "@mui/material/Typography";

function Home() {
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [dateTime, setDateTime] = useState('2022-03-01 17');
  const [visitorsAndEarnings, setVisitorsAndEarnings] = useState([]);

  const [chartTitle, setChartTitle] = useState('Density of Participants at parts of Ohio');

  return (
    <ParticipantsContext.Provider value={{selectedParticipants,setSelectedParticipants}}>
      <BuildingContext.Provider value={{selectedBuildings,setSelectedBuildings}}>
        <DateTimeContext.Provider value={{dateTime, setDateTime}}>
          <EarningsAndVisitorsContext.Provider value={{visitorsAndEarnings, setVisitorsAndEarnings}}>
            <Typography variant="h4" component="h1" gutterBottom>
              {chartTitle}
            </Typography>
          </EarningsAndVisitorsContext.Provider>
        </DateTimeContext.Provider>
      </BuildingContext.Provider >
    </ParticipantsContext.Provider>
  );
}

export default Home;
