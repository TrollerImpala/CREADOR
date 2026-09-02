//import '../../styles/Nav-menu.css';
//import logo from '../../assets/METTIA-logo.png';

import '../../styles/Nav.css';

import { useNavigate } from 'react-router-dom';

function Nav() {
  const Navigate = useNavigate();

  return (
    <nav className="navbar">

      <div className="nav-container">
      
        <ul className="nav-links">
          <li><a onClick={() => Navigate('/Arte')}>Galeria Arte</a></li>
        </ul>
      
      </div>

    </nav>
  );
}

export default Nav;