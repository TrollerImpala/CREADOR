/**
 * useForm.tsx — Hook reutilizable para formularios.
 *
 * Capa: hook de React (estado + fetch).
 * Lo usan Login, Register, PostJobOffer, PostearArte, etc.
 *
 * Qué centraliza:
 * - formData: un objeto con todos los campos.
 * - handleChange: actualiza un campo por su atributo name.
 * - handleSubmit: hace POST JSON a urlApi y llama onSuccess/onFailure.
 * - handleTextAreaChange / handleSelectChange: variantes por tipo de input.
 *
 * Limitación importante:
 * handleSubmit siempre envía JSON y NO agrega el header Authorization.
 * Por eso las pantallas que suben archivos o requieren token (arte, ofertas)
 * arman su propio fetch con FormData y Bearer en lugar de usar handleSubmit.
 */
import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';

import { errorMsg } from '../tools/errorUtils';

// Configuración que recibe el hook. <T> es el tipo del objeto del formulario.
interface UseFormConfig<T> {
  valoresIniciales : T;
  urlApi : string;
  eMsg : string;
  onSuccess: (data: any) => void;
  onFailure: (response: Response) => void;
  opc ?: boolean;
}

export function useForm<T>({ valoresIniciales, urlApi, eMsg, onSuccess, onFailure, opc = false }: UseFormConfig<T>) {
  // Estado del formulario: un solo objeto, no un useState por campo.
  const [formData, setFormData] = useState<T>(valoresIniciales);
  //const [loading, setLoading] = useState(false);

  /**
   * Actualiza el campo cuyo name coincide con el input.
   * Limpia caracteres conflictivos para evitar inyección básica de HTML.
   * Ojo: esta limpieza solo aplica a <input>, no a textarea ni select.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const cleanValue = value.replace(/["'<>;/#$-]/g, "");

    // Spread: conserva los demás campos y reemplaza solo el que cambió.
    setFormData( (prev) => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData( (prev) => ({
      ...prev,
      [name]: value
    }));
    console.log(formData);
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData( (prev) => ({
      ...prev,
      [name]: value
    }));
    console.log(formData);
  };

  /**
   * Envío del formulario.
   *
   * e.preventDefault() evita que el navegador recargue la página.
   * fetch(urlApi, ...) hace la petición y response.ok indica 2xx.
   * Si la respuesta es ok, parsea el JSON y llama onSuccess.
   * Si no, llama onFailure y registra el error con errorMsg.
   */
  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    
    e.preventDefault();
    //setLoading(true);
    try {

      const response = await fetch(urlApi, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
    
      } else {
        onFailure(response);
        await errorMsg(response, eMsg);
      }
    } catch (error) {
      // Error de red: el servidor no respondió.
      console.error("Error de conexión:", error);
    }/* finally {
      setLoading(false);
    }*/
  };

  // opc = false devuelve el set básico (Login, Register).
  if (!opc){
    return {
      setFormData,
      formData,
      handleChange,
      handleSubmit
    };
  }
  
  // opc = true agrega los handlers de textarea y select.
  return {
    setFormData,
    formData,
    
    handleChange,
    handleTextAreaChange,
    handleSelectChange,

    handleSubmit,
    //loading
  };
}