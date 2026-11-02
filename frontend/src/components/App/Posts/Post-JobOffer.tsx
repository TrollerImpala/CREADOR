import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import { errorMsg } from '../../tools/errorUtils';
import { refreshToken } from '../../tools/refresh_token';

import '../../../styles/Postear.css';

interface JobOfferForm {
  project_title: string;
  project_info: string;
  email: string;
  tags: string;
}

function PostJobOffer() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const { formData, handleChange, handleTextAreaChange } = useForm<JobOfferForm>({
    valoresIniciales: {
      project_title: '',
      project_info: '',
      email: '',
      tags: '',
    },
    urlApi: '',
    eMsg: '',
    onSuccess: () => {},
    onFailure: (response : Response) => {
      if (response.status === 400) {
        setMensajeError("Error en los datos ingresados. Por favor, verifique la información proporcionada.");
      } else {
        setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
      }
    },
    opc: true,
  });

  const enviarPeticion = async (token: string) => {
    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    return await fetch(`${import.meta.env.VITE_API_URL}/JobOffer/PostJobOffer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_title: formData.project_title,
        project_info: formData.project_info,
        email: formData.email,
        tags: tagsArray,
      }),
    });
  };

  const handleSubmitCustom = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.project_title || !formData.email) {
      setMensajeError('Completa al menos el título y el email de contacto');
      return;
    }

    setEnviando(true);

    try {
      let response = await enviarPeticion(localStorage.getItem('access_token')!);

      if (response.status === 401) {
        const refreshed = await refreshToken();
        
        if (refreshed) {
          const newAccessToken = localStorage.getItem('access_token');
          
          if (newAccessToken) response = await enviarPeticion(newAccessToken);
        } else return;
      }

      if (response.ok) {
        //alert('¡Oferta publicada con éxito!');
        const data = await response.json();
        navigate(`/JobOffers/${data.job_offer.project_id}`);
      } else {
        if (response.status === 400 || response.status === 422) {
          setMensajeError("Error en los datos ingresados. Por favor, verifique la información proporcionada.");
        } else {
          setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
        }
        await errorMsg(response, 'Error al publicar la oferta de trabajo');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="postear-form-wrapper">
      <h2>Publicar Oferta de Trabajo</h2>
      <form onSubmit={handleSubmitCustom} className="postear-form">
        <label>Título de la oferta:</label>
        <input
          type="text"
          name="project_title"
          value={formData.project_title}
          onChange={handleChange}
          required
        />

        <label>Descripción:</label>
        <textarea
          name="project_info"
          value={formData.project_info}
          onChange={handleTextAreaChange}
          rows={6}
        />

        <label>Email de contacto:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Etiquetas (separadas por comas):</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="ej: react, node, remoto"
        />

        <button type="submit" disabled={enviando} className="btn-postear-submit">
          {enviando ? 'Publicando...' : 'Publicar Oferta'}
        </button>
      </form>
      {mensajeError && <h2 id="error-message">{mensajeError}</h2>}
    </div>
  );
}

export default PostJobOffer;