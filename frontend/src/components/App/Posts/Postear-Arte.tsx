import { useState } from 'react';
import { useForm } from '../../hooks/useForm';

import { errorMsg } from '../../tools/errorUtils';
import { refreshToken } from '../../tools/refresh_token';

interface ArtPostForm {
  title: string;
  description: string;
  tags: string;
  rating: string;
}

function PostearArte() {
  const [artImg, setArtImg] = useState<File | null>(null);

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

    opc: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    if (e.target.files && e.target.files[0]) {
      setArtImg(e.target.files[0]);
    }
  };

  const enviarPeticion = async (token: string) => {
    const dataForm = new FormData();
    dataForm.append('title', formData.title);
    dataForm.append('description', formData.description);
    dataForm.append('rating', formData.rating);

    const arrayTags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    arrayTags.forEach((tag) => dataForm.append('tags[]', tag));

    if (artImg) {
      dataForm.append('art_img', artImg);
    }

    return await fetch('http://localhost:8080/api/Art/PostArt', {
      method: 'POST',
      
      headers: {
        Authorization: `Bearer ${token}`,
      },
      
      body: dataForm,
    });
  };

  const handleSubmitCustom = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!artImg) {
      alert('Por favor selecciona una imagen');
      
      return;
    }

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
        const data = await response.json();
        alert('¡Publicación creada con éxito!' + data);

      } else {
        await errorMsg(response, 'Error al publicar la obra de arte');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  return (
    <form onSubmit={handleSubmitCustom}>
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

      <button type="submit">Publicar Arte</button>
    </form>
  );
}

export default PostearArte;