import { useEffect, useState } from "react";
import ArtPostPrev from "../../templates/ArtTemplate";
import type { ArtInfo, UserPostsGalleriesProp } from "../../tools/types";
import { errorMsg } from "../../tools/errorUtils";

function UserArtGallery({ user_id }: UserPostsGalleriesProp) {
    const [posts, setPosts] = useState<ArtInfo[]>([]);
    const [cargandoPosts, setCargandoPosts] = useState(true);

    const obtenerArteUsuario = async () => {
        try {
            setCargandoPosts(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/Art/UserArtPosts/${user_id}?from=0&limit=12`);
            if (!response.ok) {
                await errorMsg(response, 'Error al cargar publicaciones del usuario');
                return;
            }
            const data = await response.json();
            setPosts(data.art ?? []);
        } catch (error) {
            console.error('Error al obtener posts de arte:', error);
        } finally {
            setCargandoPosts(false);
        }
    };

    useEffect(() => {
        if (user_id) {
            obtenerArteUsuario();
        }
    }, [user_id]);

    return (
        <section className="user-profile-gallery">
            <h3 className="gallery-title">Obras de Arte</h3>

            {cargandoPosts ? (
                <p className="cargando-texto">Cargando obras...</p>
            ) : posts.length > 0 ? (
                <div className="user-art-grid">
                    {posts.map((post) => (
                        <ArtPostPrev key={post.artpost_id} post={post} />
                    ))}
                </div>
            ) : (
                <p className="sin-obras-texto">Este usuario no ha publicado obras de arte aún.</p>
            )}
        </section>
    );
}

export default UserArtGallery;