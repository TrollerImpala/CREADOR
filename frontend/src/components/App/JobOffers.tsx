import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { JobOfferInfo } from "../tools/types";
import { errorMsg } from "../tools/errorUtils";
import JobOfferTemplate from "../templates/JobOfferTemplate";

function JobOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<JobOfferInfo[]>([]);

  const obtenerOfertas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/JobOffer/JobOfferPosts`);

      if (!response.ok) {
        await errorMsg(response, 'Error al cargar las ofertas de trabajo');
        return;
      }

      const data = await response.json();
      setOffers(data.job_offers ?? []);
    } catch (error) {
      console.error('No se han podido cargar las ofertas de trabajo', error);
    }
  };

  useEffect(() => {
    obtenerOfertas();
  }, []);

  return (
    <>
      <button onClick={() => navigate('PostJobOffer')}>Publicar Oferta</button>

      {offers.length > 0 ? (
        offers.map((offer) => <JobOfferTemplate key={offer.project_id} post={offer} />)
      ) : (
        <h3>Cargando...</h3>
      )}
    </>
  );
}

export default JobOffers;
