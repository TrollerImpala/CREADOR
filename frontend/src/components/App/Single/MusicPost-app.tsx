import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AudioPlayer from '../../Reusable/AudioPlayer';
import { errorMsg } from '../../tools/errorUtils';
import type { MusicInfo } from '../../tools/types';

import '../../../styles/single-posts-styles/MusicPost.css';

function MusicPost() {
  const { song_id } = useParams();
  const [cargando, setCargando] = useState(true);
  const [song, setSong] = useState<MusicInfo>({
    song_id: '',
    song_url: '',
    song_name: '',
    song_description: '',
    single: false,
    user_id: '',
    song_cover_url: '',
    rating: '',
    tags: [],
  });

  const obtenerCancion = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Music/MusicPost/${song_id}`);

      if (!response.ok) {
        await errorMsg(response, 'Error al cargar la canción');
        return;
      }

      const data = await response.json();
      setSong(data.song ?? {});
      setCargando(false);
    } catch (error) {
      console.error('No se ha podido cargar la canción', error);
    }
  };

  useEffect(() => {
    obtenerCancion();
  }, [song_id]);

  return (
    <div className="music-post-page">
      {cargando ? (
        <h3 className="cargando-texto">Cargando canción...</h3>
      ) : (
        <div className="music-post-container">
          <div className="music-post-header">
            <img src={song.song_cover_url} alt={song.song_name} className="music-post-cover" />
            <div className="music-post-meta">
              <h2>{song.song_name}</h2>
              <span className="music-rating-badge">Rating: {song.rating}</span>
            </div>
          </div>

          <div className="music-player-wrapper">
            <AudioPlayer src={song.song_url} isPlaying={true} />
          </div>

          <div className="music-post-description">
            <p><strong>Descripción:</strong> {song.song_description || 'Sin descripción disponible.'}</p>
          </div>

          <div className="music-post-tags">
            {(song.tags ?? []).map((tag, index) => (
              <span key={`${tag}-${index}`} className="music-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicPost;