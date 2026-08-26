import { useNavigate, Link} from "react-router-dom";

import type { ArtPrev } from "../tools/types";

function ArtPostPrev( {artpost_id, title, art_img_url, rating} : ArtPrev ){
    const Navigate = useNavigate();
    
    return (
        <>
            <Link to={`/Arte/${artpost_id}`}>
                <table>
                    <thead>
                        <tr>{rating} - {title}</tr>
                    </thead>

                    <tbody>
                        <tr>
                            <img src={art_img_url} alt={title}></img>
                        </tr>
                    </tbody>
                </table>    
            </Link>
        </>
    );
}

export default ArtPostPrev;