import { errorMsg } from "./errorUtils";

export async function logout() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Auth/LogOut`);

    if (response.ok){
        localStorage.clear();
        const exito = await response.json();
        console.log(exito.mensaje);
        
    }else {
        await errorMsg(response, 'Error al actualizar el token');
    }
    
}