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
  alert("Error en la peticion: " + (typeof errorData === "object" ? JSON.stringify(errorData) : errorData));
}
