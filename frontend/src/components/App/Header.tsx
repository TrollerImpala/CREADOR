import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../tools/logout';
import '../../styles/Header.css';
import '../../styles/Userboton.css';

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

function BotonUser() {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [inicial, setInicial] = useState('U');

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/Users/Perfil`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const resJson = await response.json();
          const userData = resJson.user || resJson;

          const fetchedAvatar = userData.user_avatar_url || userData.userAvatarUrl || '';
          setAvatarUrl(fetchedAvatar);

          const userName = userData.userName || userData.user_name || '';
          if (userName) {
            setInicial(userName.charAt(0).toUpperCase());
          }
        }
      } catch (error) {
        console.error('Error al cargar la imagen en el header:', error);
      }
    };

    fetchUserAvatar();
  }, []);

  return (
    <button 
      id="btn-user-avatar" 
      onClick={() => navigate('/User')}
      title="Ver perfil"
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="header-avatar-img"
        />
      ) : (
        inicial
      )}
    </button>
  );
}

export function Header() {
  const accessToken = localStorage.getItem('access_token');

  return (
    <header>
      <div id="title-head">
        <h1>CREADOR</h1>
      </div>

      {!accessToken ? (
        <div id="Ini-Reg">
          <BotonLogin />
          <BotonRegister />
        </div>
      ) : (
        <div className="user-actions-container">
          <BotonUser />
          <BotonLogout />
        </div>
      )}
    </header>
  );
}

export default Header;