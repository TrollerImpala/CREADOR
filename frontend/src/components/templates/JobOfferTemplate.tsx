/**
 * JobOfferTemplate.tsx — Tarjeta de vista previa de una oferta.
 *
 * Capa: plantilla de presentación (recibe props, no hace fetch).
 * Se usa en JobOffers.tsx dentro de un .map().
 *
 * El Link envuelve la tarjeta y navega al detalle usando project_id.
 */
import { Link } from "react-router-dom";

import type { JobOfferInfo } from "../tools/types";
import '../../styles/templates-styles/JobOfferTemplate.css';

function JobOfferTemplate({ post }: { post: JobOfferInfo }) {
    return (
        <Link to={`/JobOffers/${post.project_id}`} className="job-offer-link">
            
            <div className="prev-job-post">
                <div className="prev-job-header">
                    <h3>{post.project_title}</h3>
                    {post.email && <span className="prev-job-email">{post.email}</span>}
                </div>

                <div className="prev-job-tags">
                    {(post.tags ?? []).map((tag, index) => (
                        <span key={`${tag}-${index}`} className="prev-job-tag">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

export default JobOfferTemplate;