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

  const [page, setPage] = useState<number>(0);
  const limit = 2;

  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Music/MusicPosts?from=${page * limit}&limit=${limit}`);
      if (!response.ok) await errorMsg(response, 'Error al cargar la cancion');
      
      const data = await response.json();
  
      if (data.songs.length > limit){
        //console.log('hay mas songs q limite');
        setHasNextPage(true);
        data.songs.pop();

      } else{
        //console.log('hasta ahi');
        setHasNextPage(false);
      }
    
      setPosts(data.songs ?? []);
    
    }catch (error){
      throw new Error('No se han podido cargar los posts de cancion');
    }
  }

  useEffect(() => { obtenerPosts(); }, [page]);

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
      <button className="btn-paginar" onClick={() => setPage(page - 1)} disabled={page === 0}>Anterior</button>
      <button className="btn-paginar" onClick={() => setPage(page + 1)} disabled={!hasNextPage}>Siguiente</button>
    
    </div>
  );
}
  
export default GaleriaMusica;