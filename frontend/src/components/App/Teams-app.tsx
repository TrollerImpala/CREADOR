import CreateTool from "./Create-tool";

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