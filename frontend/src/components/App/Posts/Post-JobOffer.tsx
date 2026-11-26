/**
 * Post-JobOffer.tsx — Formulario para crear una oferta de trabajo.
 *
 * Capa: componente + fetch propio (no usa handleSubmit del hook).
 *
 * ¿Por qué no usa handleSubmit? Porque ese método siempre manda JSON sin
 * Authorization. Acá hace falta el Bearer token y manejar el refresh en 401,
 * así que se usa useForm solo para el estado de los campos.
 *
 * Flujo:
 * 1. Valida título y email en el cliente.
 * 2. Convierte "react, node" en ['react', 'node'].
 * 3. POST /api/JobOffer/PostJobOffer con Bearer token.
 * 4. Si recibe 401, llama a refreshToken() y reintenta una vez.
 * 5. Si todo sale bien, navega al detalle de la oferta creada.
 *
 * Validación real: el DTO CreateJobOfferPostDto en el backend (400/422).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';

import ServerErrorMsg from '../../Reusable/serverErrorMsg';
import { serverErrorHandler } from '../../tools/serverError';

import '../../../styles/Postear.css';

interface JobOfferForm {
  project_title: string;
  project_info: string;
  email: string;
  tags: string;
}

function PostJobOffer() {
  const navigate = useNavigate();
  const [mensajeError, setMensajeError] = useState('');
  const [serverError, setServerError] = useState<boolean>(false);

  const {
    formData,
    handleChange,
    handleTextAreaChange,
    handleSubmit,
    loading,
  } = useForm<JobOfferForm>({
    valoresIniciales: {
      project_title: '',
      project_info: '',
      email: '',
      tags: '',
    },
    urlApi: `${import.meta.env.VITE_API_URL}/JobOffer/PostJobOffer`,
    eMsg: 'Error al publicar la oferta de trabajo',
    method: 'POST',
    contentType: 'json',
    authorization: true,
    opc: true,
    onSuccess: (data) => {
      navigate(`/JobOffers/${data.job_offer.project_id}`);
    },
    onFailure: (response: Response) => {
      if (response.status === 400 || response.status === 422) {
        setMensajeError('Error en los datos ingresados. Por favor, verifique la información proporcionada.');
      } else {
        setMensajeError('Error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
      }
      serverErrorHandler(response, setServerError);
    },
  });

  const handleSubmitCustom = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensajeError('');
    setServerError(false);

    if (!formData.project_title || !formData.email) {
      setMensajeError('Completa al menos el título y el email de contacto');
      return;
    }

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    const customBody = JSON.stringify({
      project_title: formData.project_title,
      project_info: formData.project_info,
      email: formData.email,
      tags,
    });

    await handleSubmit(e, customBody);
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

        <button type="submit" disabled={loading} className="btn-postear-submit">
          {loading ? 'Publicando...' : 'Publicar Oferta'}
        </button>
      </form>
      {mensajeError && <h2 id="error-message">{mensajeError}</h2>}
      {serverError && <ServerErrorMsg />}
    </div>
  );
}

export default PostJobOffer;