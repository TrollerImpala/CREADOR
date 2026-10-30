type FuncionType = () => void;

export interface CreateToolProps {
    funsBtns: FuncionType[];
}
export interface PublicUser {
    user_tag: string;
    user_name: string;
    user_decription?: string;
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
}

// export interface ArtPrev {
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
}
