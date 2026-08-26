import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';

import { errorMsg } from '../tools/errorUtils';

interface UseFormConfig<T> {
  valoresIniciales : T;
  urlApi : string;
  eMsg : string;
  onSuccess: (data: any) => void;
}

export function useForm<T>({ valoresIniciales, urlApi, eMsg, onSuccess }: UseFormConfig<T>) {
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