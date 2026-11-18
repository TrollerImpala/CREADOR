/**
 * Login.tsx — Pantalla de inicio de sesión.
 *
 * Capa: componente de presentación + llamada HTTP mediante useForm.
 *
 * Flujo:
 * 1. useForm guarda email/password en estado y hace POST a /api/Auth/Login.
 * 2. Si la respuesta es ok, onSuccess guarda tokens y perfil en localStorage.
 * 3. Si falla, onFailure muestra el mensaje según el status (401 = credenciales).
 * 4. Tras el éxito navega a "/".
 *
 * El backend devuelve:
 * { user_token, refresh_token, user, role }
 */
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

import { useForm } from "../hooks/useForm";

import "../../styles/Auth.css"


function Login(){

  const [enviando, setEnviando] = useState(false);

  const [mensajeError, setMensajeError] = useState('');

  // Cambia la clase del body mientras esta pantalla está montada.
  // El return del useEffect es la limpieza: se ejecuta al desmontar.
  useEffect(() => {
    document.body.className = 'body-login';

    return () => {
      document.body.className = '';
    };
  }, []);

  const Navigate = useNavigate();

  // useForm centraliza: estado de inputs, submit, fetch y errores.
  const { formData, handleChange, handleSubmit } = useForm({
    valoresIniciales : {
      email : "",
      password : ""
    },

    // VITE_API_URL se reemplaza en build time por la URL del backend.
    urlApi : `${import.meta.env.VITE_API_URL}/Auth/Login`,

    eMsg : "Error en las credenciales",

    onSuccess : (userData) => {
      console.log("Usuario logeado con exito:", userData);
      
      // Los tokens y el perfil quedan en localStorage para las próximas
      // peticiones. Es una decisión existente del proyecto (vulnerable a XSS).
      localStorage.setItem('access_token', userData.user_token);
      localStorage.setItem('refresh_token', userData.refresh_token);
      localStorage.setItem('usuario', JSON.stringify(userData.user));
      localStorage.setItem('role', userData.role);


      //alert("¡Logeo exitoso!");
      Navigate("/");
    },
    onFailure : (response) => {
      setEnviando(false);
      console.error("Error en la solicitud:", response);
      // 401 = credenciales inválidas; cualquier otro = error inesperado.
      if (response.status === 401) {
        setMensajeError("Error en las credenciales");
      } else {
        setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
      }
    }
  });
  // Chequeo visual: muestra un mensaje si faltan campos, pero no cancela
  // el submit. La validación real la hace el DTO en el backend.
  const sendInit = () => {
    setEnviando(true);
    setMensajeError('');
    if (!formData.email.trim() || !formData.password.trim()) {
      setMensajeError("Por favor, complete todos los campos.");
      setEnviando(false);
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
             <input type="submit" value={enviando ? 'Iniciando sesión...' : 'Iniciar Sesión'} id = "boton-envio" onClick={sendInit}></input>
            </form>
            {mensajeError && <p id="error-message">{mensajeError}</p>}
            <p>¿No tienes cuenta? <a href="/Register">Registrate</a></p>
        </div>
      </>
  );
}

export default Login;