import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import CreateTool from "./Create-tool";
import '../../styles/GaleriaMusica.css';

import Nav from "./Nav";

import type { MusicInfo, CreateToolProps } from "../tools/types";

import { useForm } from "../hooks/useForm";
import { errorMsg } from "../tools/errorUtils";

import MusicPostPrev from "../templates/MusicTemplate";

function GaleriaMusica() {
  const Navigate = useNavigate();

  const [posts, setPosts] = useState<MusicInfo[]>([]);

  const obtenerPosts = async () => {
    try{
      const response = await fetch('http://localhost:8080/api/Music/MusicPosts');
      if (!response.ok) await errorMsg(response, 'Error al cargar la cancion');
      
      const data = await response.json();
      
      setPosts(data.songs);
    
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

        <div className="music-grid">
          {posts.map((post) =>
            <div className="music-card-wrapper">
              <MusicPostPrev post={post} />
            </div>
          )}
        </div>

        { (posts.length == 0) && <h3 className="cargando-musica">Cargando...</h3>}
      </div>
    </div>
  );
}
  
export default GaleriaMusica;