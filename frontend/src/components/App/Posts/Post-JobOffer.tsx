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
import { errorMsg } from '../../tools/errorUtils';
import { refreshToken } from '../../tools/refresh_token';

import '../../../styles/Postear.css';

interface JobOfferForm {
  project_title: string;
  project_info: string;
  email: string;
  tags: string; // En el formulario es un string; se transforma antes de enviar.
}

function PostJobOffer() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // urlApi vacío y callbacks vacíos: el envío se maneja a mano más abajo.
  // opc: true habilita handleTextAreaChange (para la descripción).
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

  /**
   * Hace la petición con el token recibido.
   * Separa esta función para poder reintentar tras un refresh.
   */
  const enviarPeticion = async (token: string) => {
    // "react, node, remoto" → ['react', 'node', 'remoto']
    // filter elimina elementos vacíos si el usuario deja comas de más.
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

    // Validación de UX. El backend vuelve a validar con el DTO.
    if (!formData.project_title || !formData.email) {
      setMensajeError('Completa al menos el título y el email de contacto');
      return;
    }

    setEnviando(true);

    try {
      let response = await enviarPeticion(localStorage.getItem('access_token')!);

      // Token vencido: se renueva y se reintenta UNA vez.
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
        // El backend devuelve { job_offer: {...} }; se navega con su id.
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
      // Fallo de red: no hubo respuesta del servidor.
      console.error('Error de conexión:', error);
    } finally {
      // Se ejecute bien o mal, se vuelve a habilitar el botón.
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