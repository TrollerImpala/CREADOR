import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { useNavigate } from 'react-router-dom';

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
  const [artImg, setArtImg] = useState<File | null>(null);
  const navigate = useNavigate();
  const [mensajeError, setMensajeError] = useState('');
  const [serverError, setServerError] = useState<boolean>(false);

  const {
    formData,
    handleChange,
    handleTextAreaChange,
    handleSelectChange,
    handleSubmit,
    loading,
  } = useForm<ArtPostForm>({
    valoresIniciales: {
      title: '',
      description: '',
      tags: '',
      rating: 'G',
    },
    urlApi: `${import.meta.env.VITE_API_URL}/Art/PostArt`,
    eMsg: 'Error al publicar el arte',
    method: 'POST',
    contentType: 'none', // Omite Content-Type para multipart/form-data
    authorization: true, // Adjunta Bearer token y refresca en 401
    opc: true,
    onSuccess: (data) => {
      navigate(`/Arte/${data.art.artpost_id}`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArtImg(e.target.files[0]);
    }
  };

  const onFormSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensajeError('');
    setServerError(false);

    if (!artImg) {
      setMensajeError('Por favor selecciona una imagen');
      return;
    }

    const dataForm = new FormData();
    dataForm.append('title', formData.title);
    dataForm.append('description', formData.description);
    dataForm.append('rating', formData.rating);

    const arrayTags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    arrayTags.forEach((tag) => dataForm.append('tags[]', tag));
    dataForm.append('art_img', artImg);

    await handleSubmit(e, dataForm);
  };

  return (
    <div className="postear-form-wrapper">
      <h2>Publicar Arte</h2>
      <form onSubmit={onFormSubmit} className="postear-form">
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

        <button type="submit" disabled={loading} className="btn-postear-submit">
          {loading ? 'Publicando...' : 'Publicar Arte'}
        </button>
      </form>
      {mensajeError && <h2 id="error-message">{mensajeError}</h2>}
      {serverError && <ServerErrorMsg />}
    </div>
  );
}

export default PostearArte;