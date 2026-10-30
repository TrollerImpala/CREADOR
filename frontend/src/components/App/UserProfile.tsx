import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../Reusable/Header";
import Nav from "../Reusable/Nav";
import ArtPostPrev from "../templates/ArtTemplate";

import type { PublicUser } from "../tools/types";

import type { ArtInfo } from "../tools/types";
import { errorMsg } from "../tools/errorUtils";

import "../../styles/UserProfile.css";


function UserProfile() {
    const { user_id } = useParams();

    const [user, setUser] = useState<PublicUser | null>(null);
    const [posts, setPosts] = useState<ArtInfo[]>([]);
    const [cargandoUser, setCargandoUser] = useState(true);
    const [cargandoPosts, setCargandoPosts] = useState(true);

    const obtenerDatosUsuario = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/Users/Usuario/${user_id}`);
            if (!response.ok) {
                await errorMsg(response, 'Error al cargar información del usuario');
                return;
            }
            const data = await response.json();
            setUser(data.publicUser ?? null);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
        } finally {
            setCargandoUser(false);
        }
    };

    const obtenerArteUsuario = async () => {
        try {
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
            obtenerDatosUsuario();
            obtenerArteUsuario();
        }
    }, [user_id]);

    return (
        <div className="user-profile-page">
            <Header />
            <Nav />

            <div className="user-profile-container">
                {/* Columna Izquierda: Información del Usuario */}
                <aside className="user-profile-sidebar">
                    {cargandoUser ? (
                        <p className="cargando-texto">Cargando perfil...</p>
                    ) : user ? (
                        <div className="user-card">
                            <div className="user-avatar-wrapper">
                                <img
                                    src={user.user_avatar_url}
                                    alt={user.user_name || "Avatar"}
                                    className="profile-avatar"
                                />
                            </div>
                            <h2 className="profile-name">{user.user_name || "Usuario"}</h2>
                            <span className="profile-tag">@{user.user_tag}</span>

                            <p className="profile-description">
                                {user.user_decription || "Sin descripción disponible."}
                            </p>
                        </div>
                    ) : (
                        <p className="error-texto">Usuario no encontrado.</p>
                    )}
                </aside>

                {/* Columna Derecha: Galería de Arte del Usuario */}
                <main className="user-profile-gallery">
                    <h3 className="gallery-title">Obras de Arte</h3>

                    {cargandoPosts ? (
                        <p className="cargando-texto">Cargando obras...</p>
                    ) : posts.length > 0 ? (
                        <div className="user-art-grid">
                            {posts.map((post) => (
                                <ArtPostPrev post={post} />
                            ))}
                        </div>
                    ) : (
                        <p className="sin-obras-texto">Este usuario no ha publicado obras de arte aún.</p>
                    )}
                </main>
            </div>
        </div>
    );
}

export default UserProfile;