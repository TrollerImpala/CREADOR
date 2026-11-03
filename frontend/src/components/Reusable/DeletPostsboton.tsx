import { useNavigate } from "react-router-dom";
import { errorMsg } from "../tools/errorUtils";
import { refreshToken } from "../tools/refresh_token";

type TipoPost = "arte" | "musica" | "JobOfferta";

interface DeletPostsbotonProps {
    postId?: string;
    tipo?: TipoPost;
    redirectTo?: string;
    postUserId?: string; // ID individual opcional
    post?: any;          // Objeto completo del post (arte, música u oferta)
}

function DeletPostsboton({ postId, tipo = "arte", redirectTo = "/arte", postUserId, post }: DeletPostsbotonProps){
    const navigate = useNavigate();

    // Obtenemos los datos del usuario logueado en el navegador
    const usuarioLogueadoStr = localStorage.getItem('usuario');
    const rolLocalStorage = localStorage.getItem('role');
    
    const usuarioLogueado = usuarioLogueadoStr ? JSON.parse(usuarioLogueadoStr) : null;
    
    const currentUserId = usuarioLogueado?.id_user || usuarioLogueado?.id || usuarioLogueado?.user_id;
    const rolUsuario = rolLocalStorage || usuarioLogueado?.role || usuarioLogueado?.rol;

    const rolLimpio = rolUsuario ? String(rolUsuario).toLowerCase().trim() : '';

    const tienePermisoEspecial =  
        rolLimpio === 'moderator';

    const creadorId = post?.user_id;

    const esDueño = currentUserId && creadorId && String(currentUserId).trim() === String(creadorId).trim();

    if (!tienePermisoEspecial && !esDueño) {
        return null; 
    }

    const enviarPeticion = async (token: string) => {
        return await fetch(`${import.meta.env.VITE_API_URL}/GeneralPosts/Deleteposts/${postId}?tipo=${tipo}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    };

    const handleDeletePost = async () => {
        if (!postId) return;
        if (!window.confirm('¿Seguro que querés eliminar este post? Esta acción no se puede deshacer.')) return;

        try {
            let token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('user_token') || '';
            let response = await enviarPeticion(token);

            // Manejo de expiración del token (401)
            if (response.status === 401) {
                const refreshed = await refreshToken();
                if (refreshed) {
                    const newAccessToken = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
                    if (newAccessToken) {
                        response = await enviarPeticion(newAccessToken);
                    }
                } else {
                    return; // Si el refresco falla, refreshToken() ya redirige al Login
                }
            }

            if (!response.ok) {
                await errorMsg(response, 'Error al borrar el post');
                return;
            }

            navigate(redirectTo);
        } catch (error) {
            console.error(error);
            alert('No se ha podido borrar el post');
        }
    };

    return (
        <button type="button" className="post-options-item danger" onClick={handleDeletePost}>
            Eliminar post
        </button>
    );
}

export default DeletPostsboton;