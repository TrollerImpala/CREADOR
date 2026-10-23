import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { JobOfferInfo } from "../tools/types";
import { errorMsg } from "../tools/errorUtils";
import JobOfferTemplate from "../templates/JobOfferTemplate";
import Header from "../Reusable/Header";
import Nav from "../Reusable/Nav";

import '../../styles/JobOffers.css';

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
    <div className="job-offers-page">
      <Header />
      <Nav />
      
      <div className="job-offers-content">
        <button className="btn-postear-oferta" onClick={() => navigate('PostJobOffer')}>
          Publicar Oferta
        </button>

        <div className="job-offers-grid">
          {offers.length > 0 ? (
            offers.map((offer) => <JobOfferTemplate key={offer.project_id} post={offer} />)
          
          ) : (
          
            <h3 className="cargando-job-offers">Cargando ofertas...</h3>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobOffers;