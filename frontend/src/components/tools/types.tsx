/**
 * types.tsx — Tipos compartidos del frontend.
 *
 * Capa: tipos (solo TypeScript, no se ejecuta en runtime).
 * Reflejan la forma de las respuestas del backend y de las filas de Supabase.
 * Cuando agregás una columna o una relación en el backend, actualizá acá
 * para que el editor te avise si la UI usa mal el dato.
 */

type FuncionType = () => void;

export interface CreateToolProps {
    funsBtns: FuncionType[];
}
export interface PublicUser {
    user_tag: string;
    user_name: string;
    user_decription?: string; // Ojo: typo existente, la columna real es user_description
    user_avatar_url?: string;
}


export interface ArtInfo {
    artpost_id : string;
    title : string;
    art_img_url : string;
    rating : string;
    description ?: string;
    tags ?: string[];
    user_id ?: string;
    // Relación anidada que devuelve Supabase con USERS(...)
    USERS?: {
        user_tag: string;
        user_name: string;
        user_avatar_url: string;
    }
}

export interface JobOfferInfo {
    project_id: string;
    project_title: string;
    project_info?: string;
    email?: string;
    tags?: string[];
    user_id?: string;
    created_at?: string;
    USERS?: {
        user_tag: string;
        user_name: string;
        user_avatar_url: string;
    }
}

// interface ArtPrev {
//     artpost_id : string;
//     title : string;
//     art_img_url : string;
//     rating : string;
// }

export interface MusicInfo {
    song_id : string;
    song_url : string;
    song_name : string;
    song_description : string;
    single : boolean;
    user_id : string;
    song_cover_url : string;
    rating : string;
    tags : string[];
    USERS?: {
        user_tag: string;
        user_name: string;
        user_avatar_url: string;
    }
}


export interface UserPostsGalleriesProp {
    user_id : string
}

export interface PublicationCounts {
    arte: number;
    musica: number;
    ofertas: number;
    total: number;
}   