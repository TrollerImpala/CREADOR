import { useState } from "react";

import CreateTool from "./Create-tool";
import type { CreateToolProps } from "../tools/types";

import { useForm } from "../hooks/useForm";

function CrearEvento( { funsBtns } : CreateToolProps ){
  const {formData, handleChange, handleSubmit} = useForm({
    valoresIniciales : {
      eventName : "",
      eventDesc : "",
      eventDate : ""
    },

    tipo : 'get',
    
    urlApi : 'http://localhost:8080/api/Auth/login',

    eMsg : "Datos del Evento invalidos",
    
    onSuccess : (eventData) => {
      console.log("Evento Creado con exito:", eventData);
      alert("¡Evento " + formData.eventName + " Creado!");
      funsBtns[0](); // Ocultar Form Evento
      funsBtns[1](); // Ocultar Opciones
    }
  });

  return (
    <>
      <div>
        <button onClick={funsBtns[0]}>X</button>
      
        <form onSubmit = {handleSubmit}>

          <label>Crea tu evento</label>
          <input type="text" name="eventName" value={formData.eventName} placeholder="Ej: Excursion" onChange={handleChange}></input>
          <input type="text" name="eventDesc" value={formData.eventDesc} placeholder="Viaje a museo de ...." onChange={handleChange}></input>
          <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange}></input>

          <input type="submit" value="Enviar solicitud"></input>
        </form>
      </div>
    </>
  );
}

function OpcionesEventos( { funsBtns } : CreateToolProps ){

  const showEventForm = () => {
    //alert("Crea un evento");
    funsBtns[0](); // Ocultar opciones
    funsBtns[3](); // Mostrar form
  }

  const blockInstitutionalEvent = () => {
    alert("Este requiere ser premium");
  }
  return (
    <>
      <div>
        <button onClick={funsBtns[0]}>X</button>
        
        <button onClick={showEventForm}>Evento Personal</button>
        <button onClick={showEventForm}>Evento Formal</button>
        <button onClick={blockInstitutionalEvent}>Evento Institucional</button>
      </div>   
    </>
  );
}

function GaleriaArte() {
  const [esVisibleOpt, setVisibilidadOpt] = useState<boolean>(false);

  const showEventOptionsBox = () => {
    //alert("Eliga tipo de evento");
    setVisibilidadOpt(true);
  }

  const hideEventOptionsBox = () => {
    setVisibilidadOpt(false);
  }

  const [esVisibleForm, setVisibilidadForm] = useState<boolean>(false);

  const showEventForm = () => {
    //alert("Eliga tipo de evento");
    setVisibilidadForm(true);
  }

  const hideEventForm = () => {
    setVisibilidadForm(false);
    showEventOptionsBox();
  }


  return (
    <>
      <CreateTool funcionSeccion={showEventOptionsBox}/>

      {
        esVisibleOpt && <OpcionesEventos funsBtns = {[ hideEventOptionsBox, showEventOptionsBox, hideEventForm, showEventForm ]} />
      }
      {
        esVisibleForm && <CrearEvento funsBtns = {[ hideEventForm, hideEventOptionsBox ]} />
      }
    </>
  );
}
  
export default GaleriaArte;