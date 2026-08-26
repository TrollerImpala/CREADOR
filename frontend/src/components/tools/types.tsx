type FuncionType = () => void;

export interface CreateToolProps {
    funsBtns: FuncionType[];
}

export interface ArtInfo {
    artpost_id : string;
    title : string;
    art_img_url : string;
    description : string;
    tags : string[];
    rating : string;
    user_id : string;
}

export interface ArtPrev {
    artpost_id : string;
    title : string;
    art_img_url : string;
    rating : string;
}