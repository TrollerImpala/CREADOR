import React, { useState, useEffect } from 'react';
import '../../styles/UserPage.css';
import { refreshToken } from '../tools/refresh_token';

export function User() {
  const [formData, setFormData] = useState({
    userTag: '',
    userName: '',
    userDescription: '',
    socialMedias: ''
  });
  
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [errorServer, setErrorServer] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Cargar la información original exclusivamente desde el endpoint de Users
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
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

          setFormData({
            userTag: userData.userTag || userData.user_tag || '',
            userName: userData.userName || userData.user_name || '',
            userDescription: userData.userDescription || userData.user_description || '',
            socialMedias: Array.isArray(userData.socialMedias || userData.social_medias) 
              ? (userData.socialMedias || userData.social_medias).join(', ') 
              : (userData.socialMedias || userData.social_medias || '')
          });
          const avatarUrl = userData.user_avatar_url || userData.user_avatar_url || '';
          setAvatarUrl(avatarUrl);
        } else {
          setErrorServer('No se pudo obtener la información del perfil desde el servidor.');
          refreshToken();
          fetchProfile(); // Reintentar después de refrescar el token
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        setErrorServer('Error de red al intentar cargar el perfil.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImg(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setErrorServer('');

    if (!formData.userTag.trim()) {
      setErrorServer('El Tag de usuario es obligatorio.');
      return;
    }

    try {
      const accessToken = localStorage.getItem('access_token');
      const dataToSend = new FormData();

      dataToSend.append('userTag', formData.userTag);
      if (formData.userName) dataToSend.append('userName', formData.userName);
      if (formData.userDescription) dataToSend.append('userDescription', formData.userDescription);
      
      if (formData.socialMedias) {
        const socialArray = formData.socialMedias.split(',').map(s => s.trim()).filter(Boolean);
        socialArray.forEach((social, index) => {
          dataToSend.append(`socialMedias[${index}]`, social);
        });
      }

      if (profileImg) {
        dataToSend.append('profile_img', profileImg);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/Users/ActualizarPerfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: dataToSend
      });

      const responseData = await response.json();

      if (response.ok) {
        setMensaje('¡Perfil actualizado con éxito!');
      } else {
        setErrorServer(responseData.message || 'Error al actualizar el perfil en el servidor.');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setErrorServer('Error de red: No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="user-page-container">
      <h2>Mi Perfil</h2>
      <form onSubmit={handleSubmit} className="user-form">
         <div className="form-group">
          <label>Imagen de perfil actual:</label>
          {formData.userTag && (
            <img 
              width={200}
              src={avatarUrl || 'default-avatar.png'}
              alt="Avatar del usuario" 
              className="user-avatar"
            />
          )}
        </div>
        
        <div className="form-group">
          <label>Etiqueta / Tag (userTag): <span style={{ color: 'red' }}>*</span></label>
          <input 
            type="text" 
            name="userTag" 
            value={formData.userTag} 
            onChange={handleChange} 
            required
            placeholder="Obligatorio"
          />
        </div>

        <div className="form-group">
          <label>Nombre de usuario (userName):</label>
          <input 
            type="text" 
            name="userName" 
            value={formData.userName} 
            onChange={handleChange} 
            placeholder="Opcional"
          />
        </div>

        <div className="form-group">
          <label>Descripción (userDescription):</label>
          <textarea 
            name="userDescription" 
            value={formData.userDescription} 
            onChange={handleChange} 
            placeholder="Cuéntanos algo sobre ti (opcional)"
          />
        </div>

        <div className="form-group">
          <label>Redes sociales (separadas por comas):</label>
          <input 
            type="text" 
            name="socialMedias" 
            value={formData.socialMedias} 
            onChange={handleChange} 
            placeholder="Ej: twitter.com/miusuario (opcional)"
          />
        </div>

        <div className="form-group">
          <label>Imagen de perfil (profile_img):</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange} 
          />
        </div>

        <button type="submit" className="btn-save">Guardar Cambios</button>
        
        {mensaje && <p className="mensaje-estado" style={{ color: 'green' }}>{mensaje}</p>}
        {errorServer && <p className="mensaje-estado" style={{ color: 'red' }}>{errorServer}</p>}
      </form>
    </div>
  );
}

export default User;