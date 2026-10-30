import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../../Reusable/Header";
import Nav from "../../Reusable/Nav";

import UserArtGallery from "./UserArtGallery";
import UserMusicGallery from "./UserMusicGallery";
import UserOffers from "./UserOffers";

import type { PublicUser } from "../../tools/types";
import { errorMsg } from "../../tools/errorUtils";

import "../../../styles/UserProfile.css";

type Seccion = 'arte' | 'musica' | 'ofertas';

function UserProfile() {
    const { user_id } = useParams<{ user_id: string }>();

    const [user, setUser] = useState<PublicUser | null>(null);
    const [cargandoUser, setCargandoUser] = useState(true);
    const [seccionActiva, setSeccionActiva] = useState<Seccion>('arte');

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

    useEffect(() => {
        if (user_id) {
            obtenerDatosUsuario();
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

                {/* Columna Derecha: Secciones con Barra de Navegación Interna */}
                <main className="user-profile-content">
                    <nav className="profile-tabs-nav">
                        <button
                            className={`tab-btn ${seccionActiva === 'arte' ? 'active' : ''}`}
                            onClick={() => setSeccionActiva('arte')}
                        >
                            Arte
                        </button>
                        <button
                            className={`tab-btn ${seccionActiva === 'musica' ? 'active' : ''}`}
                            onClick={() => setSeccionActiva('musica')}
                        >
                            Música
                        </button>
                        <button
                            className={`tab-btn ${seccionActiva === 'ofertas' ? 'active' : ''}`}
                            onClick={() => setSeccionActiva('ofertas')}
                        >
                            Ofertas
                        </button>
                    </nav>

                    <div className="profile-tab-body">
                        {user_id && seccionActiva === 'arte' && <UserArtGallery user_id={user_id} />}
                        {user_id && seccionActiva === 'musica' && <UserMusicGallery user_id={user_id} />}
                        {user_id && seccionActiva === 'ofertas' && <UserOffers user_id={user_id} />}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserProfile;