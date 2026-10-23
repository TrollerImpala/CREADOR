import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Nav.css';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Función para detectar cuál botón está activo
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="subnav-container">
      <ul className="subnav-menu">
        <li 
          className={`subnav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          HOME
        </li>

        <span className="separator">|</span>

        <li 
          className={`subnav-item ${isActive('/Arte') ? 'active' : ''}`}
          onClick={() => navigate('/Arte')}
        >
          ART
        </li>

        <span className="separator">|</span>

        <li 
          className={`subnav-item ${isActive('/film') ? 'active' : ''}`}
          onClick={() => navigate('/film')}
        >
          FILM
        </li>

        <span className="separator">|</span>

        <li 
          className={`subnav-item ${isActive('/Musica') ? 'active' : ''}`}
          onClick={() => navigate('/Musica')}
        >
          MUSIC
        </li>

        <span className="separator">|</span>

        <li 
          className={`subnav-item ${isActive('/JobOffers') ? 'active' : ''}`}
          onClick={() => navigate('/JobOffers')}
        >
          OFFERS / PROJECTS
        </li>
      </ul>
    </div>
  );
}

export default Nav;