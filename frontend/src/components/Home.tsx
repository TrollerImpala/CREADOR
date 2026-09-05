import { useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { refreshToken } from './tools/refresh_token';

import { logout } from './tools/logout';

import '../styles/Home.css'
//import logo from '../assets/METTIA-logo.png'
//import rick from '../assets/rickroll.gif'


function Boton_login() {
  const Navigate = useNavigate();
  
  const click = () => {
    Navigate('/Login');

  };

  return (<button id='btn-log' onClick={click}>Iniciar sesion</button>);

}

function Boton_register() {
  const Navigate = useNavigate();

  const click = () => {
    Navigate('/Register');
  };

  return (<button id='btn-reg' onClick={click}>Registrarse</button>);

}

function Boton_logout() {
  const Navigate = useNavigate();

  const click = async () => {
    await logout();
    Navigate(0);  
  }

  return (<button id='btn-logout' onClick={click}>Cerrar sesion</button>);
}

function Home() {

  const Navigate = useNavigate();

  
  useEffect(() => {
    //localStorage.clear();
    //refreshToken();
  }, []);

  
  return (
    <>

      <header>
        <div id = 'title-head'>
          <h1>CREADOR</h1>
        </div>
        {!localStorage.getItem('access_token') ? (
          <>          
            <div id='Ini-Reg'>
              <Boton_login />
              <br></br>
              <Boton_register />
            </div>          
          </>
          ) : (
            <>
              <h3>Hola {JSON.parse(localStorage.getItem('usuario')!).user_name}</h3>
              <Boton_logout />
            </>
          )
        }

      </header>
      
      <nav>
       <button onClick={() => Navigate('/Arte')} className='btn-seccion'>Galeria Arte</button>
      </nav>
      
      <section>
        <h1>Bienvenidos a la pagina!</h1>
        
        <h2>
          En la pagina principal, tendria que haber un tablon mostrando un poco de todas las creaciones
          (por ejemplo, dibujos, musica, proyectos de teams, etc)
        </h2>
      </section>


      <footer>
        <div>
          <h2>CREADOR</h2>
          <p>©CREADOR - Pagina hecha por el team 01</p>
        </div>
      </footer>
    </>
  )
}

export default Home