import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Reusable/Header";
import Nav from "../Reusable/Nav";
import type { ArtInfo } from "../tools/types";
import { errorMsg } from "../tools/errorUtils";
import ArtPostPrev from "../templates/ArtTemplate";
import '../../styles/GaleriaArte.css';

function GaleriaArte() {
  const Navigate = useNavigate();

  const [posts, setPosts] = useState<ArtInfo[]>([]);

  const [page, setPage] = useState<number>(0);
  const limit = 10;
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const obtenerPosts = async () => {
    try{
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Art/ArtPosts?from=${page * limit}&limit=${limit}`);
      if (!response.ok) await errorMsg(response, 'Error al cargar el Arte');
      
      const data = await response.json();
      
      if (data.art.length > limit){
        //console.log('hay mas songs q limite');
        setHasNextPage(true);
        data.art.pop();

      } else{
        //console.log('hasta ahi');
        setHasNextPage(false);
      }

      setPosts(data.art);
    
    }catch (error){
      throw new Error('No se han podido cargar los posts de arte');
    }
  }

  useEffect(() => { obtenerPosts(); }, [page]);

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
      <button className="btn-paginar" onClick={() => setPage(page - 1)} disabled={page === 0}>Anterior</button>
      <button className="btn-paginar" onClick={() => setPage(page + 1)} disabled={!hasNextPage}>Siguiente</button>
    </>
  );
}
  
export default GaleriaArte;