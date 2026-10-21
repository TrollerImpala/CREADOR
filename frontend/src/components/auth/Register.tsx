import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';

import { useForm } from "../hooks/useForm";

//import "../../styles/Auth.css";

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
      alert("¡Registro exitoso!");
      Navigate("/Login");
    },

  });

  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const cleanValue = value.replace(/["' <>;/@#$-]/g, "");
    
    setFormData( (prev) => ({
      ...prev,
      [name]: cleanValue
    }));
  }

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
                </>
              )}
              </form>
                
            </div>
        </>
    );
}

export default Register;