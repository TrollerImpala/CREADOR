import { useNavigate, Link} from "react-router-dom";

import type { ArtInfo } from "../tools/types";

import '../../styles/templates-styles/ArtTemplate.css';

function ArtPostPrev ( { post } : { post: ArtInfo } ) {
    const Navigate = useNavigate();
    
    return (
        <>
            <Link to={`/Arte/${post.artpost_id}`}>
            
            <div className="prev-art-post">
                <div className="prev-art-info">
                    <h3>
                        {post.rating}
                    </h3>
                            
                    <h3>
                        {post.title}
                    </h3>                         
                </div>
                
                <div className="prev-art-container">               
                    <img src={post.art_img_url} alt={post.title}></img>    
                </div>
            </div>    
            
            </Link>
        </>
    );
}

export default ArtPostPrev;