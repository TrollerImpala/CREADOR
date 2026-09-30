import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import CreateTool from "./Create-tool";

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
      const response = await fetch('http://localhost:8080/api/Music/MusicPosts');//, {
      //   method : 'GET',
      //   headers : {[]
      //     'Content-Type' : 'application/json',
      //     'Authorization' : `Bearer ${localStorage.getItem('access_token')}`
      //   }}
      // );
      if (!response.ok) await errorMsg(response, 'Error al cargar la cancion');
      
      const data = await response.json();
      
      setPosts(data.songs);
    
    }catch (error){
      throw new Error('No se han podido cargar los posts de cancion');
    }
  }

  useEffect(() => { obtenerPosts(); }, []);

  return (
    <>
      
      <Header/>
      <Nav/>

      <button onClick={() => Navigate('PostearCancion')}>Postear Cancion</button>
      {posts.map((post) =>
        <MusicPostPrev post={post} />
        
      )}

      { (posts.length == 0) && <h3>Cargando...</h3>}
    </>
  );
}
  
export default GaleriaMusica;