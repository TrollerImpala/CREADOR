import { errorMsg } from "./errorUtils";

export async function logout() {
    const response = await fetch('http://localhost:8080/api/Auth/LogOut');

    if (response.ok){
        localStorage.clear();
        const exito = await response.json();
        alert(exito.mensaje);
        
    }else {
        await errorMsg(response, 'Error al actualizar el token');
    }
    
}