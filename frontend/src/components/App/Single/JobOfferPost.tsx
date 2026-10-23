import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { errorMsg } from "../../tools/errorUtils";
import type { JobOfferInfo } from "../../tools/types";

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
        <>
            {cargando ? (
                <h3>Cargando oferta...</h3>
            ) : (
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
                    <div>
                        <h2>{offer.project_title}</h2>
                    </div>

                    <div style={{ margin: '16px 0' }}>
                        <p><strong>Email de contacto:</strong> {offer.email}</p>
                        <p><strong>Descripción:</strong> {offer.project_info ?? 'Sin descripción disponible.'}</p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                        {(offer.tags ?? []).map((tag, index) => (
                            <span key={`${tag}-${index}`} style={{ background: '#f0f0f0', borderRadius: '999px', padding: '4px 8px' }}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    <form target="_blank" action={`https://formsubmit.co/${offer.email}`} method="POST">
                        <div>
                            <label>Tu nombre:</label>
                            <input type="text" name="name" placeholder="Nombre completo" required style={{ display: 'block', width: '100%', marginBottom: '12px' }} />
                        </div>

                        <div>
                            <label>Tu email:</label>
                            <input type="email" name="email" placeholder="correo@ejemplo.com" required style={{ display: 'block', width: '100%', marginBottom: '12px' }} />
                        </div>

                        <div>
                            <label>Mensaje:</label>
                            <textarea name="message" rows={8} placeholder="Cuéntanos por qué te interesa esta oferta" required style={{ display: 'block', width: '100%', marginBottom: '12px' }} />
                        </div>

                        <button type="submit">Enviar solicitud</button>
                    </form>
                </div>
            )}
        </>
    );
}

export default JobOfferPost;
