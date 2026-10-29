import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { errorMsg } from "../../tools/errorUtils";
import type { ArtInfo } from "../../tools/types";

import '../../../styles/single-posts-styles/ArtPost.css'

interface ExtendedArtInfo extends ArtInfo {
    USERS?: {
        user_tag: string;
        user_name: string;
        user_avatar_url: string;
    };
}

function ArtPost(){
    const navigate = useNavigate();

    const { artpost_id } = useParams();

    const [cargando, setCargando] = useState(true);

    const [post, setPost] = useState<ExtendedArtInfo>(
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/Art/ArtPost/${artpost_id}`);
            if (!response.ok) await errorMsg(response, 'Error al cargar el Arte');
      
            const data = await response.json();
      
            setPost(data.art);
            setCargando(false);
    
        }catch (error){
            throw new Error('No se ha podido cargar el post de arte');
        }
    }

    useEffect(() => { obtenerPost(); }, []);

    void navigate;

    return (
        <>
            {cargando ? (
                <>
                    <h3>Cargando Post...</h3>
                </>
            ) : (
                <>
                    <div className="main-post-container">
                        {/* Bloque de Usuario Agregado */}
                        {post.USERS && (
                            <div className="main-post-user">
                                <img src={post.USERS.user_avatar_url} alt={post.USERS.user_name} className="user-avatar" />
                                <div className="user-info">
                                    <span className="user-name">{post.USERS.user_name}</span>
                                    <span className="user-tag">@{post.USERS.user_tag}</span>
                                </div>
                            </div>
                        )}

                        <div className="main-post-header">
                            <div>{post.rating} - {post.title}</div>
                        </div>

                        <div className="main-post-body">
                            <div className="main-post-img-container">
                                <img src={post.art_img_url} alt={post.title}></img>
                            </div>
                            <div className="main-post-desc-container">
                                <p>{post.description}</p>
                            </div>
                        </div>

                        <div className="main-post-footer">
                            <div className="main-post-tags">
                                {post.tags!.map((tag) => (
                                    <>
                                        <p>{tag}</p>
                                    </>
                                ))}
                            </div>
                        </div>
                    </div> 
                </>
            )}
        </>
    );
}

export default ArtPost;