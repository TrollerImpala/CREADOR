/**
 * Postear-Arte.tsx — Formulario de creación de arte con imagen.
 *
 * Capa: componente + fetch propio.
 * Es el ejemplo de multipart/form-data del frontend:
 * - Se arma un FormData y se agregan campos con append().
 * - El archivo se agrega como 'art_img' (mismo nombre que espera el
 *   FileInterceptor del backend).
 * - NO se setea Content-Type: el navegador agrega el boundary solo.
 *
 * Los tags se envían como 'tags[]', uno por cada valor.
 */
import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { useNavigate } from 'react-router-dom';

import { errorMsg } from '../../tools/errorUtils';
import { refreshToken } from '../../tools/refresh_token';

import ServerErrorMsg from '../../Reusable/serverErrorMsg';
import { serverErrorHandler } from '../../tools/serverError';

import '../../../styles/Postear.css';

interface ArtPostForm {
  title: string;
  description: string;
  tags: string;
  rating: string;
}

function PostearArte() {
  // El archivo no vive en formData: se maneja en su propio estado.
  const [artImg, setArtImg] = useState<File | null>(null);
  const navigate = useNavigate();
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [serverError, setServerError] = useState<boolean>(false);


  const { formData, handleChange, handleTextAreaChange, handleSelectChange } = useForm<ArtPostForm>({
    valoresIniciales: {
      title: '',
      description: '',
      tags: '',
      rating: 'G',
    },
    
    urlApi: '',
    eMsg: '',
    onSuccess: () => {},
    onFailure: (response : Response) => {
      if (response.status === 400 || response.status === 422) {
        setMensajeError("Error en los datos ingresados. Por favor, verifique la información proporcionada.");
      } else {
        setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
      }
      serverErrorHandler(response, setServerError);
    },
    opc: true,
  });

  // Toma el primer archivo seleccionado del input file.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArtImg(e.target.files[0]);
    }
  };

  const enviarPeticion = async (token: string) => {
    setEnviando(true);
    setServerError(false);

    // FormData arma el cuerpo multipart. Los nombres deben coincidir con
    // los que lee el backend: title, description, rating, tags[], art_img.
    const dataForm = new FormData();
    dataForm.append('title', formData.title);
    dataForm.append('description', formData.description);
    dataForm.append('rating', formData.rating);

    const arrayTags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    // Se agrega una entrada por tag; el backend la transforma en array.
    arrayTags.forEach((tag) => dataForm.append('tags[]', tag));

    if (artImg) {
      dataForm.append('art_img', artImg);
    }

    return await fetch(`${import.meta.env.VITE_API_URL}/Art/PostArt`, {
      method: 'POST',
      headers: {
        // Solo Authorization. Content-Type lo pone el navegador con boundary.
        Authorization: `Bearer ${token}`,
      },
      body: dataForm,
    });
  };

  const handleSubmitCustom = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // La imagen es obligatoria: el controller también la exige.
    if (!artImg) {
      setMensajeError('Por favor selecciona una imagen');
      return;
    }

    try {
      let response = await enviarPeticion(localStorage.getItem('access_token')!);

      // Mismo patrón que en ofertas: 401 → refresh → reintento único.
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed){
          const newAccessToken = localStorage.getItem('access_token');      
          if (newAccessToken) response = await enviarPeticion(newAccessToken);
        } else return;
        
      }

      if (response.ok) {
        setEnviando(false);
        const data = await response.json();
        //alert('¡Publicación creada con éxito!');
        navigate(`/Arte/${data.art.artpost_id}`);
      
      } else {
        setEnviando(false);
      
        if (response.status === 400 || response.status === 422) {
          setMensajeError("Error en los datos ingresados. Por favor, verifique la información proporcionada.");
      
        } else {
          setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
        }
      
        await errorMsg(response, 'Error al publicar la canción');}
        serverErrorHandler(response, setServerError);
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  return (
    <div className="postear-form-wrapper">
      <h2>Publicar Arte</h2>
      <form onSubmit={handleSubmitCustom} className="postear-form">
        <label>Título:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Imagen de la obra:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />

        <label>Descripción:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleTextAreaChange}
        />

        <label>Etiquetas (separadas por comas):</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="ej: digital, anime, paisaje"
        />

        <label>Clasificación (Rating):</label>
        <select name="rating" value={formData.rating} onChange={handleSelectChange}>
          <option value="G">G</option>
          <option value="PG">PG</option>
          <option value="PG-13">PG-13</option>
          <option value="R">R</option>
          <option value="NC">NC</option>
        </select>

        <button type="submit" disabled={enviando} className="btn-postear-submit">
          {enviando ? 'Publicando...' : 'Publicar Arte'}
        </button>
      </form>
      {mensajeError && <h2 id="error-message">{mensajeError}</h2>}
      {serverError && <ServerErrorMsg />}
    </div>
  );
}

export default PostearArte;