import { useEffect, useState } from "react";
import MusicPostPrev from "../../templates/MusicTemplate";
import AudioPlayer from "../../Reusable/AudioPlayer";
import type { MusicInfo, UserPostsGalleriesProp } from "../../tools/types";
import { errorMsg } from "../../tools/errorUtils";


function UserMusicGallery({ user_id }: UserPostsGalleriesProp) {
    const [posts, setPosts] = useState<MusicInfo[]>([]);
    const [cargandoPosts, setCargandoPosts] = useState(true);

    const [actualSong, setActualSong] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);

    const resumeSong = () => {
        setIsPlaying(true);
    };

    const pauseSong = () => {
        setIsPlaying(false);
    };

    const handleSetActualSong = (songUrl: string) => {
        if (actualSong !== songUrl) {
            pauseSong();
            setActualSong(songUrl);
        }
        setIsPlaying(true);
    };

    const obtenerMusicaUsuario = async () => {
        try {
            setCargandoPosts(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/Music/UserMusicPosts/${user_id}?from=0&limit=12`);
            if (!response.ok) {
                await errorMsg(response, 'Error al cargar canciones del usuario');
                return;
            }
            const data = await response.json();
            setPosts(data.songs ?? []);
        } catch (error) {
            console.error('Error al obtener posts de música:', error);
        } finally {
            setCargandoPosts(false);
        }
    };

    useEffect(() => {
        if (user_id) {
            obtenerMusicaUsuario();
        }
    }, [user_id]);

    return (
        <section className="user-profile-gallery">
            <h3 className="gallery-title">Música</h3>

            {actualSong && (
                <AudioPlayer
                    src={actualSong}
                    isPlaying={isPlaying}
                    onPlay={resumeSong}
                    onPause={pauseSong}
                />
            )}

            {cargandoPosts ? (
                <p className="cargando-texto">Cargando música...</p>
            ) : posts.length > 0 ? (
                <div className="music-grid">
                    {posts.map((post) => (
                        <div className="music-card-wrapper" key={post.song_id}>
                            <MusicPostPrev
                                post={post}
                                setActualSong={handleSetActualSong}
                                pauseSong={pauseSong}
                                resumeSong={resumeSong}
                                isPlaying={isPlaying && actualSong === post.song_url}
                                actualSong={actualSong}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="sin-obras-texto">Este usuario no ha publicado música aún.</p>
            )}
        </section>
    );
}

export default UserMusicGallery;