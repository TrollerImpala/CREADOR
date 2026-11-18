/**
 * DeletPostsboton.tsx — Botón reutilizable para borrar publicaciones.
 *
 * Capa: componente reutilizable.
 * Lo usan los detalles de arte, música y ofertas.
 *
 * Lógica:
 * 1. Lee el usuario y el rol desde localStorage.
 * 2. Compara el id del usuario con post.user_id.
 * 3. Si no es dueño ni moderador, devuelve null (no muestra el botón).
 * 4. Al hacer clic, confirma y llama DELETE /api/GeneralPosts/Deleteposts/:id.
 * 5. Si recibe 401, renueva el token y reintenta.
 *
 * Importante: ocultar el botón es solo UX. La autorización real la hace
 * GeneralPostsService en el backend, que también valida dueño/moderador.
 */
import { useNavigate } from "react-router-dom";
import { errorMsg } from "../tools/errorUtils";
import { refreshToken } from "../tools/refresh_token";

// Tipos aceptados por el endpoint unificado de borrado.
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

    // Obtenemos los datos del usuario logueado en el navegador.
    // JSON.parse puede fallar si el valor está corrupto; por eso se valida antes.
    const usuarioLogueadoStr = localStorage.getItem('usuario');
    const rolLocalStorage = localStorage.getItem('role');
    
    const usuarioLogueado = usuarioLogueadoStr ? JSON.parse(usuarioLogueadoStr) : null;
    
    // Se prueban varios nombres porque el perfil y el token no siempre coinciden.
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

  /**
   * DELETE al endpoint común. El tipo va por query string.
   * No se manda body: el id va en la URL y el tipo en ?tipo=...
   */
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
        // Confirmación explícita: el borrado no se puede deshacer.
        if (!window.confirm('¿Seguro que querés eliminar este post? Esta acción no se puede deshacer.')) return;

        try {
            // Se aceptan varios nombres de token por compatibilidad histórica.
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

            // Vuelve a la galería indicada por el padre.
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