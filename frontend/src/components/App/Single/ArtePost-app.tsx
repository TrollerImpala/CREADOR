import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import { errorMsg } from "../../tools/errorUtils";
import type { ArtInfo } from "../../tools/types";
import DeletPostsboton from "../../Reusable/DeletPostsboton";

import '../../../styles/single-posts-styles/ArtPost.css'

function ArtPost(){
    const navigate = useNavigate();
    const { artpost_id } = useParams();

    const [cargando, setCargando] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [post, setPost] = useState<ArtInfo>(
        {
            artpost_id : '',
            title : '',
            art_img_url : '',
            description : '',
            tags : [''],
            rating : '',
            user_id : '',
            USERS : {
                user_tag : '',
                user_name : '',
                user_avatar_url : '',
            },
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

    useEffect(() => { obtenerPost(); }, [artpost_id]);

    // Efecto para cerrar el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuAbierto(false);
            }
        };

        if (menuAbierto) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuAbierto]);

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
                            <Link to={`/User/${post.user_id}`} style={{textDecoration : 'none'}}>
                            <div className="main-post-user">
                                <img src={post.USERS.user_avatar_url} alt={post.USERS.user_name} className="user-avatar" />
                                <div className="user-info">
                                    <span id="user-name">{post.USERS.user_name}</span>
                                    <span className="user-tag">@{post.USERS.user_tag}</span>
                                </div>
                            </div>
                            </Link>
                        )}

                        <div className="main-post-header">
                            <div>{post.rating} {post.title}</div>

                            <div className="post-options" ref={menuRef}>
                                <button
                                    type="button"
                                    className="post-options-btn"
                                    aria-label="Opciones del post"
                                    aria-haspopup="true"
                                    aria-expanded={menuAbierto}
                                    onClick={() => setMenuAbierto(!menuAbierto)}
                                >
                                    ⋯
                                </button>

                                {menuAbierto && (
                                    <div className="post-options-menu">
                                        <DeletPostsboton 
                                            postId={artpost_id} 
                                            tipo="arte" 
                                            redirectTo="/arte" 
                                            post={post} 
                                        />
                                    </div>
                                )}
                            </div>
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
                                {post.tags!.map((tag, index) => (
                                    <div key={index}>
                                        <p>{tag}</p>
                                    </div>
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