/**
 * Register.tsx — Pantalla de registro en dos pasos.
 *
 * Capa: componente de presentación + useForm.
 *
 * Paso 1: email y contraseña.
 * Paso 2: tag, nombre, descripción y redes.
 *
 * No hay ruta distinta por paso: step2Visible decide qué bloque de JSX se
 * muestra dentro del mismo formulario.
 *
 * El envío final va a POST /api/Auth/Register. El backend crea el usuario en
 * Supabase Auth; el perfil queda asociado por id en auth.users.
 */
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';

import { useForm } from "../hooks/useForm";

//import "../../styles/Auth.css";

function Register(){
    // Misma limpieza de clase del body que en Login.
    useEffect(() => {
    document.body.className = 'body-login';

    return () => {
      document.body.className = '';
    };
  }, []);

  const Navigate = useNavigate();
  const [mensajeError, setMensajeError] = useState('');

  // useForm maneja todos los campos del registro, incluidos los del paso 2.
  const {setFormData, formData, handleChange, handleSubmit} = useForm({
    valoresIniciales : {
      email : '',
      password : '',
      userTag : '',
      userName : '',
      userDescription : '',
      socialMedias : []
    },

    urlApi : `${import.meta.env.VITE_API_URL}/Auth/Register`,
    
    eMsg : "Error en los datos ingresados",
    
    onSuccess : (userData) => {
      console.log("Usuario registrado con exito:", userData);
      //alert("¡Registro exitoso!");
      // Tras registrarse no se inicia sesión automáticamente: va a Login.
      Navigate("/Login");
    },
    onFailure : (response) => {
      console.error("Error en la solicitud:", response);
      // 400 = datos inválidos o email ya registrado.
      if (response.status === 400) {
        setMensajeError("Error en los datos ingresados. Por favor, verifique la información proporcionada.");
      } else {
        setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
      }
    }

  });

  // Variante de handleChange solo para el tag: además de limpiar símbolos,
  // evita espacios y caracteres problemáticos en un identificador público.
  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const cleanValue = value.replace(/["' <>;/@#$-]/g, "");
    
    setFormData( (prev) => ({
      ...prev,
      [name]: cleanValue
    }));
  }

  // Controla qué paso se ve. No es una ruta: es estado local.
  const [step2Visible, setStep2Visible] = useState<boolean>(false);

  // const handleDniChange = (e : ChangeEvent<HTMLInputElement>) => {
  //   const { value } = e.target;
  //   setFormData( (prev) => ({
  //     ...prev,
  //     docData: { dni: value }
  //   }));
    
  // };

    return (
        <>
            <div id = "reg-box">
              {!step2Visible ? <h1>Registrarse</h1> : <h1>Perfil</h1>}
              <form onSubmit={handleSubmit}>
              {!step2Visible ? (
                <>
                  <label>E-mail: </label>
                  <input onChange={handleChange} type="email" name="email" value={formData.email} placeholder="Ingrese su correo" className="for-border"></input>
                  <br></br>

                  <label>Contraseña: </label>
                  <input onChange={handleChange} type="password" name="password" value={formData.password} placeholder="******" className="for-border"></input>
                  <br></br>
                      
                  <button id = "next-step" onClick={ () => setStep2Visible(true) }>Siguiente</button>
                </>
              ) : (
                <>
                  <button onClick={() => setStep2Visible(false)} className="btn-volver-modal">&lt;</button>
                
                  <label>Tag: </label>
                  <input onChange={handleTagChange} type="text" name="userTag" value={formData.userTag} placeholder="Artista_epico_123" className="for-border"></input>
                  <br></br>

                  <label>Nombre: </label>
                  <input onChange={handleChange} type="text" name="userName" value={formData.userName} placeholder="Pepe Art" className="for-border"></input>
                  <br></br>

                  <label>Descripcion: </label>
                  <input onChange={handleChange} type="text" name="userDescription" value={formData.userDescription} placeholder="Hola, soy..." className="for-border"></input>
                  <br></br>

                  <label>Redes sociales: </label>
                  <input onChange={handleChange} type="text" name="socialMedias" value={formData.socialMedias} placeholder="[YT: @pepeart, X: @artpepe, IG: @pepitoart...]" className="for-border" disabled></input>
                  <br></br>
                      
                  <input type="submit" value="Registrarse" id = "boton-envio"></input>
                  {mensajeError && <h2 className="error-message">{mensajeError}</h2>}
                </>
              )}
              </form>
                
            </div>
        </>
    );
}

export default Register;