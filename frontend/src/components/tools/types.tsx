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