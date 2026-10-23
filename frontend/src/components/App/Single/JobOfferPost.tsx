import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { errorMsg } from "../../tools/errorUtils";
import type { JobOfferInfo } from "../../tools/types";

import '../../../styles/single-posts-styles/JobOfferPost.css';

function JobOfferPost() {
    const navigate = useNavigate();
    const { project_id } = useParams();

    const [cargando, setCargando] = useState(true);
    const [offer, setOffer] = useState<JobOfferInfo>({
        project_id: '',
        project_title: '',
        project_info: '',
        email: '',
        tags: [],
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

    void navigate;

    return (
        <div className="job-offer-post-page">
            {cargando ? (
                <h3 className="cargando-texto">Cargando oferta...</h3>
            ) : (
                <div className="job-offer-post-container">
                    <div className="job-offer-post-header">
                        <h2>{offer.project_title}</h2>
                    </div>

                    <div className="job-offer-post-info">
                        <p className="contact-email"><strong>Email de contacto:</strong> {offer.email}</p>
                        <p className="project-description"><strong>Descripción:</strong> {offer.project_info ?? 'Sin descripción disponible.'}</p>
                    </div>

                    <div className="job-offer-post-tags">
                        {(offer.tags ?? []).map((tag, index) => (
                            <span key={`${tag}-${index}`} className="job-tag">
                                {tag}
                            </span>
                        ))}
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