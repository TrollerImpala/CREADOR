import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import { errorMsg } from '../../tools/errorUtils';
import { refreshToken } from '../../tools/refresh_token';

interface JobOfferForm {
  project_title: string;
  project_info: string;
  email: string;
  tags: string;
}

function PostJobOffer() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);

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
      alert('Completa al menos el título y el email de contacto');
      return;
    }

    setEnviando(true);

    try {
      let response = await enviarPeticion(localStorage.getItem('access_token')!);

      if (response.status === 401) {
        await refreshToken();
        const newAccessToken = localStorage.getItem('access_token');

        if (newAccessToken) {
          response = await enviarPeticion(newAccessToken);
        }
      }

      if (response.ok) {
        alert('¡Oferta publicada con éxito!');
        navigate('/JobOffer');
      } else {
        await errorMsg(response, 'Error al publicar la oferta de trabajo');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmitCustom} style={{ maxWidth: '700px', margin: '24px auto', display: 'grid', gap: '12px' }}>
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

      <button type="submit" disabled={enviando}>
        {enviando ? 'Publicando...' : 'Publicar oferta'}
      </button>
    </form>
  );
}

export default PostJobOffer;
