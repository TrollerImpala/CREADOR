import { useNavigate, Link} from "react-router-dom";

import type { MusicInfo } from "../tools/types";

import '../../styles/templates-styles/MusicTemplate.css';

function MusicPostPrev ( { post } : { post: MusicInfo } ) {
    const Navigate = useNavigate();
    
    return (
        <>
            <Link to={`/Music/${post.song_id}`}>
            
            <div className="prev-Music-post">
                <div className="prev-Music-info">
                    <h3>
                        {post.rating}
                    </h3>
                            
                    <h3>
                        {post.song_name}
                    </h3>                         
                </div>
                
                <div className="prev-Music-container">               
                    <img src={post.song_cover_url} alt={post.song_name}></img>    
                </div>
            </div>    
            
            </Link>
        </>
    );
}

export default MusicPostPrev;