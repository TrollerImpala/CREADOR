import { Link } from "react-router-dom";

import type { MusicInfo } from "../tools/types";

import '../../styles/templates-styles/MusicTemplate.css';

interface MusicPostPrevProps {
    post: MusicInfo;
    setActualSong: (songUrl: string) => void;
    pauseSong: () => void;
    resumeSong: () => void;
    isPlaying: boolean;
    actualSong: string;
}

function MusicPostPrev({ post, setActualSong, pauseSong, resumeSong, isPlaying, actualSong }: MusicPostPrevProps) {
    const isCurrent = actualSong === post.song_url && isPlaying;

    return (
        <div style={{ position: 'relative' }}>
            <Link to={`/Musica/${post.song_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="prev-Music-post">
                    <div className="prev-Music-info">
                        <h3>{post.rating}</h3>
                        <h3>{post.song_name}</h3>
                    </div>

                    <div className="prev-Music-container">
                        <img src={post.song_cover_url} alt={post.song_name} />
                    </div>
                </div>
            </Link>

            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (isCurrent) {
                        console.log('Pausando dentro del template');
                        pauseSong();
                        return;
                    }

                    setActualSong(post.song_url);
                    console.log('Reproduciendo canción dentro del template');
                    console.log('URL que se deberia reproducir:', post.song_url);
                    console.log('Actual song URL:', actualSong);
                    resumeSong();
                }}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    opacity: isCurrent ? 1 : 0.7,
                    transition: 'opacity 0.2s ease',
                    cursor: 'pointer',
                    zIndex: 2,
                }}
            >
                {isCurrent ? 'Pause' : 'Play'}
            </button>
        </div>
    );
}

export default MusicPostPrev;