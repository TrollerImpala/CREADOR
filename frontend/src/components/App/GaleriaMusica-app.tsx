import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Reusable/Header";
import '../../styles/GaleriaMusica.css';

import Nav from "../Reusable/Nav";

import type { MusicInfo } from "../tools/types";

import { errorMsg } from "../tools/errorUtils";
import AudioPlayer from "../Reusable/AudioPlayer";

import MusicPostPrev from "../templates/MusicTemplate";

function GaleriaMusica() {
  const Navigate = useNavigate();

  const [posts, setPosts] = useState<MusicInfo[]>([]);
  const [actualSong, setActualSong] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  const resumeSong = () => {
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  const handleSetActualSong = (songUrl: string) => {
    if (actualSong !== songUrl) {
      console.log('Cambiando canción a:', songUrl);
      pauseSong();
      setActualSong(songUrl);
    }

    setIsPlaying(true);
  };

  const obtenerPosts = async () => {
    try{
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Music/MusicPosts`);
      if (!response.ok) await errorMsg(response, 'Error al cargar la cancion');
      
      const data = await response.json();
      
      setPosts(data.songs ?? []);
    
    }catch (error){
      throw new Error('No se han podido cargar los posts de cancion');
    }
  }

  useEffect(() => { obtenerPosts(); }, []);

  return (
    <div className="galeria-musica-page">
      <Header/>
      <Nav/>

      <div className="galeria-musica-content">
        <button className="btn-postear-cancion" onClick={() => Navigate('PostearCancion')}>
          Postear Cancion
        </button>

        {actualSong && (
          <AudioPlayer
            src={actualSong}
            isPlaying={isPlaying}
            onPlay={resumeSong}
            onPause={pauseSong}
          />
        )}

        <div className="music-grid">
          {posts.map((post) =>
            <div className="music-card-wrapper" key={post.song_id}>
              <MusicPostPrev
                post={post}
                setActualSong={handleSetActualSong}
                pauseSong={pauseSong}
                resumeSong={resumeSong}
                isPlaying={isPlaying && actualSong === post.song_url}
                actualSong={actualSong}
              />
            </div>
          )}
        </div>

        { (posts.length == 0) && <h3 className="cargando-musica">Cargando...</h3>}
      </div>
    </div>
  );
}
  
export default GaleriaMusica;