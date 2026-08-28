import { useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { refreshToken } from './tools/refresh_token';

import { logout } from './tools/logout';

//import '../styles/Home.css'
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

  const click = () => {
    logout();
    Navigate(0);  
  }

  return (<button id='logout-btn' onClick={click}>Cerrar sesion</button>);
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
        <div id=  'title-head'>
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

       <button onClick={() => Navigate('/Arte')}>Galeria Arte</button>

      <footer>
        <div>
          <h2>CREADOR</h2>
          <p>©CREADOR</p>
        </div>
      </footer>
    </>
  )
}

export default Home