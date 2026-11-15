/**
 * errorUtils.tsx — Utilidad para mostrar errores HTTP en consola.
 *
 * Capa: utilidad.
 * No lanza excepciones ni muestra UI: solo intenta leer el cuerpo del error
 * y lo imprime. Los componentes deciden qué mensaje mostrar al usuario.
 *
 * Orden de lectura:
 * 1. Intenta response.json() (errores típicos de NestJS).
 * 2. Si no es JSON, intenta response.text().
 * 3. Si ambos fallan, usa el mensaje recibido por parámetro.
 *
 * Ojo: consumir el body acá puede impedir que el caller lo lea después.
 */
export async function errorMsg(response : Response, msg : string){
  let errorData = msg;
  try {
      errorData = await response.json();
          
    } catch (e) {
      try {
        const textError = await response.text();
        if (textError) errorData = textError;
        
      } catch (textErr) {}
    }

  console.error("Error del servidor:", errorData);
  console.log("Error en la peticion: " + (typeof errorData === "object" ? JSON.stringify(errorData) : errorData));
}
