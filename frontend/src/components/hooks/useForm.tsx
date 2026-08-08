import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';

import { errorMsg } from '../tools/errorUtils';

interface UseFormConfig<T> {
  valoresIniciales : T;
  tipo : string;
  urlApi : string;
  filter ?: string;
  eMsg : string;
  onSuccess: (data: any) => void;
}

export function useForm<T>({ valoresIniciales, tipo, urlApi, filter = "", eMsg, onSuccess }: UseFormConfig<T>) {
  const [formData, setFormData] = useState<T>(valoresIniciales);
  //const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData( (prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    
    e.preventDefault();
    //setLoading(true);
    try {
      let response : Response;

      switch (tipo.toLowerCase()){
        
        case 'get':
          response = await fetch(urlApi + filter);
          break;

        case 'post': 
          response = await fetch(urlApi, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
          break;
        
        case 'put':
          response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            method: 'PUT',
            body: JSON.stringify({ id: 1, title: 'Updated', body: 'Content', userId: 1 }),
            headers: { 'Content-Type': 'application/json' }
          });
          break;
        
        default:
          throw new Error('Especificar tipo de peticion');
          
      }
      

      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
    
      } else {
        await errorMsg(response, eMsg);
      }
    
    } catch (error) {
      console.error("Error de conexión:", error);
    }/* finally {
      setLoading(false);
    }*/
  };

  return {
    setFormData,
    formData,
    handleChange,
    handleSubmit,
    //loading
  };
}