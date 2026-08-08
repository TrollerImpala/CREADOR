import { Link, useNavigate } from 'react-router-dom';

import '../styles/Home.css'
import logo from '../assets/METTIA-logo.png'
import rick from '../assets/rickroll.gif'


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

function Home() {

  return (
    <>

      <header>
        <div id=  'title-head'>
          <h1>MEETIA</h1>
        </div>

        <div id='Ini-Reg'>
          <Boton_login />
          <br></br>
          <Boton_register />
        </div>
      </header>
      <section id='titulo'>
        <div id='titulo-txt'>
          <h1>Organizá eventos sin estrés</h1>
          <p>
            Planificá, coordiná y gestioná cada detalle de tus eventos desde una única plataforma inteligente
          </p> 
        </div>
        <div id='logo'>
          <img src={logo}></img>
        </div>
      </section>

      <section>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        {/* COMO FUNCIONA */}
        <hr></hr>
        <br></br>
          <div className='sub-titulo'>
            <h1>¿Cómo funciona?</h1>
          </div>
        <div className='info-boxes'>        
          <div>
            <div>
              <h2>Crear evento</h2>
              <p>MEETIA te permite crear eventos medainte el uso de su aplicacion permitiendote configurar inclusos si es un evento o grupo ademas de editar sua tributos</p>
            </div>
            <img src={rick} alt='fun-gif'></img>
          </div>
          <div>
            <div>
              <h2>Invitar participantes</h2>
              <p>A la hora de crear un grupo o evento podras invitar persoas a las cuales tengas agregadas como amigos, ademas de poder publicarlo de forma online para todos</p>
            </div>
            <img src={rick} alt='fun-gif'></img>
          </div>
          <div>
            <div>
              <h2>Gestionar todo desde MEETIA</h2>
              <p>Se da la posibilidad de poder manegar todo desde MEETIA tanto la informacion del evento o grupo como las personas relacionadas, permitiendo que las pesonas tengan un control absoluto sobre su eventos o grupos para facilitar la organizacion</p>
            </div>
            <img src={rick} alt='fun-gif'></img>
          </div>
        </div>
        
        <br></br>


        {/* PORQUE ELEGIRNOS */}
        
        <div className='sub-titulo'>
          <h1>¿Por qué elegirnos?</h1>
        </div>
        <ul id='info-cards'>
          <li>
            <b>📅 Planificación</b>
            <p>
              Organizá tareas, fechas y recursos desde un único lugar.
            </p>
          </li>  
          <li>
            <b>🤝 Colaboración</b>
            <p>
              Trabajá en equipo y asigná responsabilidades fácilmente.
            </p>
          </li>
          <li>
            <b>📍 Geolocalización</b>
            <p>
              Gestion de la ubicación mediante apps externas.
            </p>
          </li>
        </ul>
      </section>
      <br></br>
      <br></br>
      <footer>
        <div>
          <h2>MEETIA</h2>
          <p>©MEETIA</p>
        </div>
      </footer>
    </>
  )
}

export default Home