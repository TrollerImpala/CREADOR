import { errorMsg } from "./errorUtils";

export async function refreshToken(){
    const current_refresh_token = localStorage.getItem('refresh_token'); 

    console.log("Token de refresco actual:", current_refresh_token);

    if (current_refresh_token){
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Auth/Refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: current_refresh_token })
        });

        if (response.ok){
            const data = await response.json();

            const new_access_token = data.access_token;
            const new_refresh_token = data.refresh_token;
            
            localStorage.setItem('access_token', new_access_token);
            localStorage.setItem('refresh_token', new_refresh_token);

            //alert('Token actualizado');
        
        }else {
            await errorMsg(response, 'Error al actualizar el token');
            
            window.location.href = '/Login';
        }
    } else window.location.href = '/Login';
}