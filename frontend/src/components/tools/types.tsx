type FuncionType = () => void;

export interface CreateToolProps {
    funsBtns: FuncionType[];
}

export interface ArtInfo {
    artpost_id : string;
    title : string;
    art_img_url : string;
    rating : string;
    description ?: string;
    tags ?: string[];
    user_id ?: string;
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
