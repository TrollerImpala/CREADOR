import { useEffect, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useNavigate } from 'react-router-dom';

import { useForm } from "../hooks/useForm";

import "../../styles/Auth.css";

function Register(){
    useEffect(() => {
    document.body.className = 'body-login';

    return () => {
      document.body.className = '';
    };
  }, []);

  const Navigate = useNavigate();

  const {setFormData, formData, handleChange, handleSubmit} = useForm({
    valoresIniciales : {
      name: '',
      surname: '',
      mail: '',
      password: '',
      birth: '',
      phone: '',
      docData: { dni: '' }
    },

    tipo : 'post',

    urlApi : 'http://localhost:8080/auth/register',
    
    eMsg : "Error en los datos ingresados",
    
    onSuccess : (userData) => {
      console.log("Usuario registrado con exito:", userData);
      alert("¡Registro exitoso!");
      Navigate("/Dashboard");
    }
  });

  const handleDniChange = (e : ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData( (prev) => ({
      ...prev,
      docData: { dni: value }
    }));
    
  };

    return (
        <>
            <div id = "reg-box">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <label>Nombre: </label>
                    <input onChange={handleChange} type="text" name="name" placeholder="Ingrese su nombre" className="for-border"></input>
                    <br></br>

                    <label>Apellido: </label>
                    <input onChange={handleChange} type="text" name="surname" placeholder="Ingrese su nombre" className="for-border"></input>
                    <br></br>

                    <label>E-mail: </label>
                    <input onChange={handleChange} type="email" name="mail" placeholder="Ingrese su correo" className="for-border"></input>
                    <br></br>

                    <label>Contraseña: </label>
                    <input onChange={handleChange} type="password" name="password" placeholder="******" className="for-border"></input>
                    <br></br>

                    <label>Fecha de Nacimiento: </label>
                    <input onChange={handleChange} type="text" name="birth" placeholder="DD-MM-YYYY" className="for-border"></input>
                    <br></br>

                    <label>Telefono: </label>
                    <input onChange={handleChange} type="text" name="phone" placeholder="Ingrese su telefono" className="for-border"></input>
                    <br></br>

                    <label>DNI: </label>
                    <input onChange={handleDniChange} type="text" name="dni" placeholder="Ingrese su DNI" className="for-border"></input>
                    <br></br>
                    
                    <input type="submit" value="Registrarse" id = "boton-envio"></input>
                </form>
            </div>
        </>
    );
}

export default Register;