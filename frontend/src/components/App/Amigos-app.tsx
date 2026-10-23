import CreateTool from "../Reusable/Create-tool";
import { useState } from "react";

import { useForm } from "../hooks/useForm";

import type { CreateToolProps } from "../tools/types";

function AgregarAmigoHtml({ funsBtns } : CreateToolProps){
  const {formData, handleChange, handleSubmit} = useForm({
    valoresIniciales : {
      friendTag : ""
    },

    urlApi : 'http://localhost:8080/api/Auth/login',
    
    eMsg : "Tag incorrecto",
    
    onSuccess : (friendData) => {
      console.log("Solicitud enviada con exito:", friendData);
      alert("¡Solicitud enviada a" + formData.friendTag + "!");
    }
  });

  return (
    <>
      <div>
        <button onClick={funsBtns[0]}>X</button>
      
        <form onSubmit = {handleSubmit}>
          <label>Enviar solicitud de amistad</label>
          <input type="text" name="friendTag" value={formData.friendTag} placeholder="ej: pepe_123_pro" onChange={handleChange}></input>
          <input type="submit" value="Enviar solicitud"></input>
        </form>
      </div>
    </>
  );
}

function Amigos() {

  const [esVisible, setVisibilidad] = useState<boolean>(false);

  const showAgregarAmigoBox = () => {
    alert("Agrega amigis");
    setVisibilidad(true);
  }

  const hideAgregarAmigoBox = () => {
    setVisibilidad(false);
  }

  return (
    <>
      <CreateTool funcionSeccion={showAgregarAmigoBox}/>
      
      {
        esVisible && <AgregarAmigoHtml funsBtns = {[hideAgregarAmigoBox]}/>
      }
    </>
  );
}
  
export default Amigos;