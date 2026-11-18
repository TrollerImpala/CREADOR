/**
 * refresh_token.tsx — Renovación del access token.
 *
 * Capa: utilidad de red.
 * Se llama cuando una petición protegida devuelve 401 por token vencido.
 *
 * Flujo:
 * 1. Lee el refresh token de localStorage.
 * 2. POST /api/Auth/Refresh con ese token.
 * 3. Si responde ok, guarda los tokens nuevos y devuelve true.
 * 4. Si falla o no hay refresh token, limpia la sesión y manda a /Login.
 *
 * Importante: no es un hook; es una función async reutilizable.
 */
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
            
            // El backend rota ambos tokens: hay que guardar los dos.
            localStorage.setItem('access_token', new_access_token);
            localStorage.setItem('refresh_token', new_refresh_token);
            return true;

            //alert('Token actualizado');
        
        }else {
            // Refresh vencido o inválido: sesión terminada.
            await errorMsg(response, 'Error al actualizar el token');
            localStorage.clear();
            window.location.href = '/Login';
            return false;
        }
    } else {
        // No hay refresh token: no se puede renovar.
        window.location.href = '/Login';
        return false;
    }
}