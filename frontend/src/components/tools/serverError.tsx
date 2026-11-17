import serverErrorMsg from "../Reusable/serverErrorMsg";

export function serverErrorHandler(response : Response, setServerError : React.Dispatch<React.SetStateAction<boolean>>){
    if (response.status === 500){
        console.error('Error en el servidor');
        setServerError(true);
    };
}