import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../tools/logout';
import '../../styles/Header.css';

function BotonLogin() {
  const navigate = useNavigate();
  return (
    <button id="btn-log" onClick={() => navigate('/Login')}>
      Iniciar sesión
    </button>
  );
}

function BotonRegister() {
  const navigate = useNavigate();
  return (
    <button id="btn-reg" onClick={() => navigate('/Register')}>
      Registrarse
    </button>
  );
}

function BotonLogout() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate(0);
  };
  return (
    <button id="btn-logout" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}

export function Header() {
  const accessToken = localStorage.getItem('access_token');
  const usuarioRaw = localStorage.getItem('usuario');
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

  return (
    <header>
      <div id="title-head">
        <h1>CREADOR</h1>
      </div>

      {!accessToken ? (
        <div id="Ini-Reg">
          <BotonLogin />
          <br />
          <BotonRegister />
        </div>
      ) : (
        <>
          <h3>Hola {usuario?.user_name}</h3>
          <BotonLogout />
        </>
      )}
    </header>
  );
}

export default Header;