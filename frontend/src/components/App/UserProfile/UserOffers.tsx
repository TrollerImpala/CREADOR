import { useEffect, useState } from "react";
import JobOfferTemplate from "../../templates/JobOfferTemplate";
import type { JobOfferInfo, UserPostsGalleriesProp } from "../../tools/types";
import { errorMsg } from "../../tools/errorUtils";

function UserOffers({ user_id }: UserPostsGalleriesProp) {
    const [offers, setOffers] = useState<JobOfferInfo[]>([]);
    const [cargandoOffers, setCargandoOffers] = useState(true);

    const obtenerOfertasUsuario = async () => {
        try {
            setCargandoOffers(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/JobOffer/UserJobOfferPosts/${user_id}?from=0&limit=12`);
            if (!response.ok) {
                await errorMsg(response, 'Error al cargar las ofertas del usuario');
                return;
            }
            const data = await response.json();
            setOffers(data.job_offers ?? []);
        } catch (error) {
            console.error('Error al obtener ofertas de trabajo:', error);
        } finally {
            setCargandoOffers(false);
        }
    };

    useEffect(() => {
        if (user_id) {
            obtenerOfertasUsuario();
        }
    }, [user_id]);

    return (
        <section className="user-profile-gallery">
            <h3 className="gallery-title">Ofertas de Trabajo</h3>

            {cargandoOffers ? (
                <p className="cargando-texto">Cargando ofertas...</p>
            ) : offers.length > 0 ? (
                <div className="job-offers-grid">
                    {offers.map((offer) => (
                        <JobOfferTemplate key={offer.project_id} post={offer} />
                    ))}
                </div>
            ) : (
                <p className="sin-obras-texto">Este usuario no ha publicado ofertas de trabajo aún.</p>
            )}
        </section>
    );
}

export default UserOffers;