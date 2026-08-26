//import '../../styles/Nav-menu.css';
//import logo from '../../assets/METTIA-logo.png';

function Nav() {
  return (
    <nav className="navbar">
      <div id = "tab-btn">
        <button>=</button>
      </div>
      <div id='options'>
        <div id='back-tab'>
          <button>&lt;</button>
        </div>
        <ul>
          <li>
            <button className='left-opt'>
              perfil
            </button>
          </li>
          <li>
            <button className='left-opt'>
              Privado
            </button>
          </li>
          <li>
            <button className='left-opt'>
              Publico
            </button>
          </li>
          <li>
            <button className='left-opt'>
              Amigos
            </button>
          </li>

        </ul>
      </div>

      <div className="nav-container">
        <ul className="nav-links">
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#grupos">Grupos</a></li>
          <li><a href="#discover">Descubrir</a></li>
        </ul>
      </div>

    </nav>
  );
}

export default Nav;