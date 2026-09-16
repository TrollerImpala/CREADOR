import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';

import { errorMsg } from '../tools/errorUtils';

interface UseFormConfig<T> {
  valoresIniciales : T;
  urlApi : string;
  eMsg : string;
  onSuccess: (data: any) => void;
  opc ?: boolean;
}

export function useForm<T>({ valoresIniciales, urlApi, eMsg, onSuccess, opc = false }: UseFormConfig<T>) {
  const [formData, setFormData] = useState<T>(valoresIniciales);
  //const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const cleanValue = value.replace(/["'<>;/#$-]/g, "");

    setFormData( (prev) => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const cleanValue = value.replace(/["' <>;/@#$-]/g, "");
    
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

  if (!opc){
    return {
      setFormData,
      formData,
      handleChange,
      handleSubmit
    };
  }
  
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