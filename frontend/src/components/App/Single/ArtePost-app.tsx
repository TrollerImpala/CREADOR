import { useNavigate, Link, useParams} from "react-router-dom";
import { useState, useEffect } from "react";

import { errorMsg } from "../../tools/errorUtils";
import type { ArtInfo } from "../../tools/types";

function ArtPost(){
    const Navigate = useNavigate();

    const { artpost_id } = useParams();

    const [cargando, setCargando] = useState(true);

    const [post, setPost] = useState<ArtInfo>(
        {
            artpost_id : '',
            title : '',
            art_img_url : '',
            description : '',
            tags : [''],
            rating : '',
            user_id : ''
        }
    );

    const obtenerPost = async () => {
        try{
            const response = await fetch(`http://localhost:8080/api/Art/ArtPost/${artpost_id}`);
            if (!response.ok) await errorMsg(response, 'Error al cargar el Arte');
      
            const data = await response.json();
      
            setPost(data.art);
            setCargando(false);
    
        }catch (error){
            throw new Error('No se han podido cargar los posts de arte');
        }
    }

    useEffect(() => { obtenerPost(); }, []);


    return (
        <>
            {cargando ? (
                <>
                    <h3>Cargando Post...</h3>
                </>
            ) : (
                <>
                    <table>
                        <thead>
                            <tr>{post.rating} - {post.title}</tr>
                        </thead>

                        <tbody>
                            <tr>
                                <img src={post.art_img_url} alt={post.title}></img>
                            </tr>
                            <tr>
                                <p>{post.description}</p>
                            </tr>
                        </tbody>

                        <tfoot>
                            <tr>
                                {post.tags.map((tag) => (
                                    <>
                                        <p>{tag}</p>
                                    </>
                                ))}
                            </tr>
                        </tfoot>
                    </table>    
   
                </>
            )}
        </>
    );
}

export default ArtPost;