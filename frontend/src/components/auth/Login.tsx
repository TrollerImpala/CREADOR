import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

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

  const { formData, handleChange, handleSubmit } = useForm({
    valoresIniciales : {
      email : "",
      password : ""
    },

    urlApi : 'http://localhost:8080/api/Auth/Login',

    eMsg : "Error en las credenciales",

    onSuccess : (userData) => {
      console.log("Usuario logeado con exito:", userData);
      
      if (userData.user_token) localStorage.setItem('access_token', userData.user_token);
      localStorage.setItem('usuario', JSON.stringify(userData.user));


      alert("¡Logeo exitoso!");
      Navigate("/");
    }
  });

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
             <input type="submit" value="Iniciar Sesion" id = "boton-envio"></input>
            </form>
        </div>
      </>
  );
}

export default Login;