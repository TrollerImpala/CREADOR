import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

import { useForm } from "../hooks/useForm";

import "../../styles/Auth.css"


function Login(){

  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    document.body.className = 'body-login';

    return () => {
      document.body.className = '';
    };
  }, []);

  const Navigate = useNavigate();

  const { formData, handleChange, handleSubmit } = useForm({
    valoresIniciales : {
      email : "",
      password : ""
    },

    urlApi : `${import.meta.env.VITE_API_URL}/Auth/Login`,

    eMsg : "Error en las credenciales",

    onSuccess : (userData) => {
      console.log("Usuario logeado con exito:", userData);
      
      localStorage.setItem('access_token', userData.user_token);
      localStorage.setItem('refresh_token', userData.refresh_token);
      localStorage.setItem('usuario', JSON.stringify(userData.user));


      //alert("¡Logeo exitoso!");
      Navigate("/");
    },
    onFailure : (response) => {
      console.error("Error en la solicitud:", response);
      if (response.status === 401) {
        setMensajeError("Error en las credenciales");
      } else {
        setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
      }
    }
  });
  const sendInit = () => {
    setMensajeError('');
    if (!formData.email.trim() || !formData.password.trim()) {
      setMensajeError("Por favor, complete todos los campos.");
    }
  }

  return (
      <>
        <div id = "log-box">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
             <label>Email: </label>
             <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ingrese su mail" className="for-border"></input>
             <br></br>
             <label>Contraseña: </label>
             <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="******" className="for-border"></input>
             <br></br>
             <input type="submit" value="Iniciar Sesion" id = "boton-envio" onClick={sendInit}></input>
            </form>
            {mensajeError && <p id="error-message">{mensajeError}</p>}
            <p>¿No tienes cuenta? <a href="/Register">Registrate</a></p>
        </div>
      </>
  );
}

export default Login;