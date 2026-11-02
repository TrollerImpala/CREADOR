import { errorMsg } from "./errorUtils";

export async function logout() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        localStorage.clear();
        return;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/Auth/LogOut`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const exito = await response.json();
        console.log(exito.mensaje);
        localStorage.clear();
    } else {
        await errorMsg(response, 'Error al cerrar sesión');
        // Limpiamos de todos modos si el token ya era inválido/expiró
        localStorage.clear();
    }
}