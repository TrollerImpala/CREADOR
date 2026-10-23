import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import { errorMsg } from '../../tools/errorUtils';
import { refreshToken } from '../../tools/refresh_token';

import '../../../styles/Postear.css';

interface SongPostForm {
  song_name: string;
  song_description: string;
  tags: string;
  rating: string;
}

function PostSong() {
  const navigate = useNavigate();
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songCoverFile, setSongCoverFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const { formData, handleChange, handleTextAreaChange, handleSelectChange } = useForm<SongPostForm>({
    valoresIniciales: {
      song_name: '',
      song_description: '',
      tags: '',
      rating: 'G',
    },
    urlApi: '',
    eMsg: '',
    onSuccess: () => {},
    onFailure: (response : Response) => {
      if (response.status === 400 || response.status === 422) {
        setMensajeError("Error en los datos ingresados. Por favor, verifique la información proporcionada.");
        console.log('se seteo el mensaje de error');
      } else {
        setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
      }
    },
    opc: true,
  });

  const handleSongFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSongFile(e.target.files[0]);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSongCoverFile(e.target.files[0]);
    }
  };

  const enviarPeticion = async (token: string) => {
    const dataForm = new FormData();
    dataForm.append('song_name', formData.song_name);
    dataForm.append('song_description', formData.song_description);
    dataForm.append('rating', formData.rating);

    const arrayTags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    arrayTags.forEach((tag) => dataForm.append('tags[]', tag));

    if (songFile) {
      dataForm.append('song_file', songFile);
    }

    if (songCoverFile) {
      dataForm.append('song_cover_img', songCoverFile);
    }

    return await fetch(`${import.meta.env.VITE_API_URL}/Music/PostMusic`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: dataForm,
    });
  };

  const handleSubmitCustom = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!songFile || !songCoverFile) {
      setMensajeError('Debes seleccionar la canción y la portada');
      return;
    }

    setEnviando(true);

    try {
      let response = await enviarPeticion(localStorage.getItem('access_token')!);

      if (response.status === 400 || response.status === 422) {
        await refreshToken();
        const newAccessToken = localStorage.getItem('access_token');

        if (newAccessToken) {
          response = await enviarPeticion(newAccessToken);
        }
      }

      if (response.ok) {
        const data = await response.json();
        navigate(`/Musica/${data.song.song_id}`);
      } else {
        if (response.status === 400 || response.status === 422) {
          setMensajeError("Error en los datos ingresados. Por favor, verifique la información proporcionada.");
        } else {
          setMensajeError("Error en la solicitud. Por favor, inténtelo de nuevo más tarde.");
        }
        await errorMsg(response, 'Error al publicar la canción');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="postear-form-wrapper">
      <h2>Publicar Canción</h2>
      <form onSubmit={handleSubmitCustom} className="postear-form">
        <label>Nombre de la canción:</label>
        <input
          type="text"
          name="song_name"
          value={formData.song_name}
          onChange={handleChange}
          required
        />

        <label>Archivo de audio:</label>
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac"
          onChange={handleSongFileChange}
          required
        />

        <label>Portada:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverFileChange}
          required
        />

        <label>Descripción:</label>
        <textarea
          name="song_description"
          value={formData.song_description}
          onChange={handleTextAreaChange}
          rows={6}
        />

        <label>Etiquetas (separadas por comas):</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="ej: rock, indie, acústica"
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
          {enviando ? 'Publicando...' : 'Publicar Canción'}
        </button>
      </form>
        {mensajeError && <h2 id="error-message">{mensajeError}</h2>}
    </div>
  );
}

export default PostSong;