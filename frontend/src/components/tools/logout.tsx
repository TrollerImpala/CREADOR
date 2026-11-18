/**
 * logout.tsx — Cierre de sesión.
 *
 * Capa: utilidad.
 * 1. Toma el access token de localStorage.
 * 2. POST /api/Auth/LogOut con Bearer.
 * 3. Limpia localStorage siempre, incluso si el token ya era inválido.
 *
 * El borrado local es lo que realmente "desloguea" en el frontend;
 * el backend invalida la sesión en Supabase.
 */
import { errorMsg } from "./errorUtils";

export async function logout() {
    const token = localStorage.getItem('access_token');

    // Sin token no hay nada que invalidar en el servidor.
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