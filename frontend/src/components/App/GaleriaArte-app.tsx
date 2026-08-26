import { useEffect, useState } from "react";

import CreateTool from "./Create-tool";
import type { ArtPrev, CreateToolProps } from "../tools/types";

import { useForm } from "../hooks/useForm";
import { errorMsg } from "../tools/errorUtils";

import ArtPostPrev from "../templates/ArtTemplate";

function GaleriaArte() {
  const [posts, setPosts] = useState<ArtPrev[]>([]);

  const obtenerPosts = async () => {
    try{
      const response = await fetch('http://localhost:8080/api/Art/ArtPosts');
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
      {posts.map((post) =>
        <ArtPostPrev
          artpost_id={post.artpost_id}
          title={post.title}
          art_img_url={post.art_img_url}
          rating={post.rating}
           />
        
      )}

      { (posts.length == 0) && <h3>Cargando...</h3>}
    </>
  );
}
  
export default GaleriaArte;