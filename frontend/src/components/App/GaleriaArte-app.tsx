import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import CreateTool from "./Create-tool";
import Nav from "./Nav";
import type { ArtInfo, CreateToolProps } from "../tools/types";
import { errorMsg } from "../tools/errorUtils";
import ArtPostPrev from "../templates/ArtTemplate";
import '../../styles/GaleriaArte.css'; // <-- Única adición para aplicar los estilos

function GaleriaArte() {
  const Navigate = useNavigate();

  const [posts, setPosts] = useState<ArtInfo[]>([]);

  const obtenerPosts = async () => {
    try{
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Art/ArtPosts`);
      if (!response.ok) await errorMsg(response, 'Error al cargar el Arte');
      
      const data = await response.json();
      
      setPosts(data.art);
    
    }catch (error){
      throw new Error('No se han podido cargar los posts de arte');
    }
  }

  useEffect(() => { obtenerPosts(); }, []);

  return (
    <>
      <Header/>
      <Nav/>

      <div className="galeria-content">
        <button className="btn-postear" onClick={() => Navigate('PostearArte')}>Postear Arte</button>
        
        <div className="posts-container">
          {posts.map((post) =>
            <ArtPostPrev post={post} />
          )}
        </div>

        { (posts.length == 0) && <h3 className="cargando-texto">Cargando...</h3>}
      </div>
    </>
  );
}
  
export default GaleriaArte;