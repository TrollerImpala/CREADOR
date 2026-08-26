import type { ArtPrev } from "../components/tools/types";

function ArtPost( {artpost_id, title, art_img_url, rating} : ArtPrev ){
    return (
        <>
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
        
        </>
    );
}

export default ArtPost;