/**
 * JobOffers.tsx — Galería de ofertas de trabajo.
 *
 * Capa: página (componente) que consume la API.
 *
 * Flujo:
 * 1. useEffect se ejecuta al montar y cada vez que cambia `page`.
 * 2. obtenerOfertas hace GET /api/JobOffer/JobOfferPosts?from=...&limit=...
 * 3. El backend devuelve una fila extra (limit + 1) para indicar si hay
 *    página siguiente; acá se hace pop() para no mostrarla.
 * 4. Se renderiza una tarjeta por oferta con .map() y se navega al detalle.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { JobOfferInfo } from "../tools/types";
import { errorMsg } from "../tools/errorUtils";
import JobOfferTemplate from "../templates/JobOfferTemplate";
import Header from "../Reusable/Header";
import Nav from "../Reusable/Nav";

import '../../styles/JobOffers.css';
import '../../styles/Pagination.css';

function JobOffers() {
  const navigate = useNavigate();
  // Lista de ofertas y estado de paginación.
  const [offers, setOffers] = useState<JobOfferInfo[]>([]);

  const [page, setPage] = useState<number>(0);
  const limit = 10;
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const obtenerOfertas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/JobOffer/JobOfferPosts?from=${page * limit}&limit=${limit}`);

      // response.ok = status 200-299. Si falla, se registra y se corta.
      if (!response.ok) {
        await errorMsg(response, 'Error al cargar las ofertas de trabajo');
        return;
      }

      const data = await response.json();

      // El service pide limit + 1 filas. Si llegaron más que el límite,
      // existe otra página; se descarta la extra con pop().
      if (data.job_offers.length > limit){
        //console.log('hay mas songs q limite');
        setHasNextPage(true);
        data.job_offers.pop();

      } else{
        //console.log('hasta ahi');
        setHasNextPage(false);
      }
      
      // ?? [] evita guardar undefined si la respuesta no trae la propiedad.
      setOffers(data.job_offers ?? []);
    } catch (error) {
      console.error('No se han podido cargar las ofertas de trabajo', error);
    }
  };

  // Se vuelve a pedir cuando cambia la página.
  useEffect(() => {
    obtenerOfertas();
  }, [page]);

  return (
    <div className="job-offers-page">
      <Header />
      <Nav />
      
      <div className="job-offers-content">
        {/* Ruta relativa: desde /JobOffers va a /JobOffers/PostJobOffer */}
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

      <div className="pagination">
        {/* Anterior se deshabilita en la primera página. */}
        <button className="btn-paginar" onClick={() => setPage(page - 1)} disabled={page === 0}>Anterior</button>
        <button className="btn-paginar" onClick={() => setPage(page + 1)} disabled={!hasNextPage}>Siguiente</button>
      </div>
    </div>
  );
}

export default JobOffers;