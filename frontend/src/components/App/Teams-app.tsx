import CreateTool from "../Reusable/Create-tool";

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