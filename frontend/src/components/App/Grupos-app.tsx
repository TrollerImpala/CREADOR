import CreateTool from "./Create-tool";
import type { CreateToolProps } from "../tools/types";

function crearGrupo(){
  alert("Crea tu grupito");
}

function Grupos() {

  return (
    <>
      <CreateTool funcionSeccion={crearGrupo}/>
    </>
  );
}
  
export default Grupos;