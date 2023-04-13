import Circular from "./circular";
import Heatmap from "./heatmap";

function Home() {
  return (
    <>
      <div className="bg-gray-100 rounded-lg flex justify-center items-center flex-col py-1 my-2 mx-10">
        <h1 className="text-xl bold">CSE 578 - 2022 VAST Mini Challenge 1 - Group Project</h1>
        <h3 className="h3">Heatmap -&gt; Chord Graph , Circular Packing Graph, Animated Scatter Plot -&gt; Bar, Pie CHart</h3>
    </div>
    <Circular />
    </>
  );
}

export default Home;
