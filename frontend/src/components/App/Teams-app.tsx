import CreateTool from "./Create-tool";
import type { CreateToolProps } from "../tools/types";

function crearTeam(){
  alert("Crea tu grupito");
}

function Teams() {

  return (
    <>
      <CreateTool funcionSeccion={crearTeam}/>
    </>
  );
}
  
export default Teams;