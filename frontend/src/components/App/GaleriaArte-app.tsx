import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { ArtInfo } from "../tools/types";

import { errorMsg } from "../tools/errorUtils";

import ArtPostPrev from "../templates/ArtTemplate";

function GaleriaArte() {
  const Navigate = useNavigate();

  const [posts, setPosts] = useState<ArtInfo[]>([]);

  const obtenerPosts = async () => {
    try{
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Art/ArtPosts`);//, {
      //   method : 'GET',
      //   headers : {
      //     'Content-Type' : 'application/json',
      //     'Authorization' : `Bearer ${localStorage.getItem('access_token')}`
      //   }}
      // );
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
      <button onClick={() => Navigate('PostearArte')}>Postear Arte</button>
      {posts.map((post) =>
        <ArtPostPrev post={post} />
        
      )}

      { (posts.length == 0) && <h3>Cargando...</h3>}
    </>
  );
}
  
export default GaleriaArte;