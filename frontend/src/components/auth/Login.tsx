import { useEffect, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useNavigate } from 'react-router-dom';

import { useForm } from "../hooks/useForm";

import "../../styles/Auth.css"


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

    tipo : 'post',

    urlApi : 'http://localhost:8080/auth/login',

    eMsg : "Error en las credenciales",

    onSuccess : (userData) => {
      console.log("Usuario logeado con exito:", userData);
      alert("¡Logeo exitoso!");
      Navigate("/Dashboard");
    }
  });

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