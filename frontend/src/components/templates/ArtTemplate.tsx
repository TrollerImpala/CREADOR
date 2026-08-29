import { useNavigate, Link} from "react-router-dom";

import type { ArtPrev } from "../tools/types";

import '../../styles/templates-styles/ArtTemplate.css';

function ArtPostPrev( {artpost_id, title, art_img_url, rating} : ArtPrev ){
    const Navigate = useNavigate();
    
    return (
        <>
            <Link to={`/Arte/${artpost_id}`}>
            
            <div className="prev-art-post">
                <div className="prev-art-info">
                    <h3>
                        {rating}
                    </h3>
                            
                    <h3>
                        {title}
                    </h3>                         
                </div>
                
                <div className="prev-art-container">               
                    <img src={art_img_url} alt={title}></img>    
                </div>
            </div>    
            
            </Link>
        </>
    );
}

export default ArtPostPrev;