import { useEffect, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useNavigate } from 'react-router-dom';

import { useForm } from "../hooks/useForm";

import "../../styles/Auth.css"

/*
async function errorMsg(response : Response){
  let errorData = "Credenciales incorrectas";
  try {
      errorData = await response.json();
          
    } catch (e) {
      try {
        const textError = await response.text();
        if (textError) errorData = textError;
        
      } catch (textErr) {}
    }

  console.error("Error del servidor:", errorData);
  alert("Error al Iniciar Sesion: " + (typeof errorData === "object" ? JSON.stringify(errorData) : errorData));
}
*/
function Login(){

  useEffect(() => {
    document.body.className = 'body-login';

    return () => {
      document.body.className = '';
    };
  }, []);

  const Navigate = useNavigate();

  const {setFormData, formData, handleChange, handleSubmit} = useForm({
    valoresIniciales : {
      mail : "",
      password : ""
    },
    urlApi : 'http://localhost:8080/auth/login',
    eMsg : "Error en las credenciales",
    onSuccess : (userData) => {
      console.log("Usuario logeado con exito:", userData);
      alert("¡Logeo exitoso!");
      Navigate("/Dashboard");
    }
  });
  /*
  const [formData, setFormData] = useState({
    mail: '',
    password: ''
  });
  


  const handleChange = (e : ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e : SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });
  
      if (response.ok) {
        const userData = await response.json();
        console.log("Usuario logeado con exito:", userData);
        alert("¡Logeo exitoso!");
        Navigate("/Dashboard");

      } else {
        await errorMsg(response);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  }; */

  return (
      <>
        <div id = "log-box">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
             <label>Email: </label>
             <input type="email" name="mail" value={formData.mail} onChange={handleChange} placeholder="Ingrese su mail" className="for-border"></input>
             <br></br>
             <label>Contraseña: </label>
             <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="******" className="for-border"></input>
             <br></br>
             <input type="submit" value="Iniciar Sesion" id = "boton-envio"></input>
            </form>
        </div>
      </>
  );
}

export default Login;