import { errorMsg } from "./errorUtils";

export async function refreshToken(){
    if (localStorage.getItem('access_token')){
        const response = await fetch('http://localhost:8080/api/Auth/Refresh');

        if (response.ok){
            const data = await response.json();

            const new_access_token = data.access_token;
            
            localStorage.setItem('access_token', new_access_token);

            //alert('Token actualizado');
        
        }else {
            await errorMsg(response, 'Error al actualizar el token');
        }
    }  
}