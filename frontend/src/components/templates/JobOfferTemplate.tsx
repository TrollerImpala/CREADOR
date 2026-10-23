import { Link } from "react-router-dom";

import type { JobOfferInfo } from "../tools/types";

function JobOfferTemplate({ post }: { post: JobOfferInfo }) {
    return (
        <Link to={`/JobOffer/${post.project_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '16px', margin: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <h3>{post.project_title}</h3>
                    {post.email && <span>{post.email}</span>}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(post.tags ?? []).map((tag, index) => (
                        <span key={`${tag}-${index}`} style={{ background: '#f0f0f0', borderRadius: '999px', padding: '4px 8px', fontSize: '12px' }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

export default JobOfferTemplate;
