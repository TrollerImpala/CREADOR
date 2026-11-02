import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useParams } from "react-router-dom";
=======
import { useNavigate, useParams, Link } from "react-router-dom";
>>>>>>> Profiles

import DeletPostsboton from "../../Reusable/DeletPostsboton";
import { errorMsg } from "../../tools/errorUtils";
import type { JobOfferInfo } from "../../tools/types";

import '../../../styles/single-posts-styles/JobOfferPost.css';

function JobOfferPost() {
    const { project_id } = useParams();

    const [cargando, setCargando] = useState(true);
    const [offer, setOffer] = useState<JobOfferInfo>({
        project_id: '',
        project_title: '',
        project_info: '',
        email: '',
        tags: [],
        USERS: {
            user_tag: '',
            user_name: '',
            user_avatar_url: '',
        },
    });

    const obtenerOferta = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/JobOffer/JobOfferPost/${project_id}`);

            if (!response.ok) {
                await errorMsg(response, 'Error al cargar la oferta de trabajo');
                return;
            }

            const data = await response.json();
            setOffer(data.job_offer ?? {});
            setCargando(false);
        } catch (error) {
            console.error('No se ha podido cargar la oferta de trabajo', error);
        }
    };

    useEffect(() => {
        obtenerOferta();
    }, [project_id]);

    const tagsList = typeof offer.tags === 'string'
        ? (offer.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
        : (offer.tags ?? []);

    return (
        <div className="job-offer-post-page">
            {cargando ? (
                <h3 className="cargando-texto">Cargando oferta...</h3>
            ) : (
                <div className="job-offer-post-container">
                    {/* Bloque de Usuario Creador */}
                    {offer.USERS && (
                        <Link to={`/User/${offer.user_id}`} className="post-user-link">
                            <div className="job-offer-user">
                                <img src={offer.USERS.user_avatar_url} alt={offer.USERS.user_name} className="user-avatar" />
                                <div className="user-info">
                                    <span className="user-name">{offer.USERS.user_name}</span>
                                    <span className="user-tag">@{offer.USERS.user_tag}</span>
                                </div>
                            </div>
                        </Link>
                    )}

                    <div className="job-offer-post-header">
                        <h2>{offer.project_title}</h2>
                    </div>

                    <div className="job-offer-post-info">
                        <p className="contact-email"><strong>Email de contacto:</strong> {offer.email}</p>
                        <p className="project-description"><strong>Descripción:</strong> {offer.project_info ?? 'Sin descripción disponible.'}</p>
                    </div>

                    <div className="job-offer-post-tags">
                        {tagsList.map((tag, index) => (
                            <span key={`${tag}-${index}`} className="job-tag">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="job-offer-post-actions" style={{ marginTop: '20px' }}>
                        <DeletPostsboton 
                            postId={offer.project_id} 
                            tipo="JobOfferta" 
                            redirectTo="/job-offers" 
                            post={offer} 
                        />
                    </div>

                    <form className="job-offer-contact-form" target="_blank" action={`https://formsubmit.co/${offer.email}`} method="POST">
                        <h3>Contactar para este proyecto</h3>
                        <div className="form-group">
                            <label>Tu nombre:</label>
                            <input type="text" name="name" placeholder="Nombre completo" required />
                        </div>

                        <div className="form-group">
                            <label>Tu email:</label>
                            <input type="email" name="email" placeholder="correo@ejemplo.com" required />
                        </div>

                        <div className="form-group">
                            <label>Mensaje:</label>
                            <textarea name="message" rows={6} placeholder="Cuéntanos por qué te interesa esta oferta" required />
                        </div>

                        <button type="submit" className="btn-submit-contact">Enviar solicitud</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default JobOfferPost;