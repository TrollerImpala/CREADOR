import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';

import { errorMsg } from '../tools/errorUtils';
import { refreshToken } from '../tools/refresh_token';

type HttpMethod = 'POST' | 'PUT' | 'PATCH';
type ContentTypeOption = 'json' | 'none';

interface UseFormConfig<T> {
  valoresIniciales: T;
  urlApi: string;
  eMsg: string;
  onSuccess: (data: any) => void;
  onFailure: (response: Response) => void;
  opc?: boolean;
  method?: HttpMethod;
  contentType?: ContentTypeOption;
  authorization?: boolean;
}

export function useForm<T>({
  valoresIniciales,
  urlApi,
  eMsg,
  onSuccess,
  onFailure,
  opc = false,
  method = 'POST',
  contentType = 'json',
  authorization = false,
}: UseFormConfig<T>) {
  const [formData, setFormData] = useState<T>(valoresIniciales);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/["'<>;/#$-]/g, '');

    setFormData((prev) => ({
      ...prev,
      [name]: cleanValue,
    }));
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Envío del formulario.
   * Acepta un `customBody` opcional (por ejemplo, un FormData construido antes de enviar).
   * Si no se pasa `customBody`, envía `formData` como JSON.
   */
  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement>,
    customBody?: BodyInit
  ) => {
    e.preventDefault();
    setLoading(true);

    // Función lambda reutilizable para el intento inicial y el reintento tras refresh
    const enviarPeticion = async (token?: string | null): Promise<Response> => {
      const headers: Record<string, string> = {};

      if (contentType === 'json') {
        headers['Content-Type'] = 'application/json';
      }

      if (authorization && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const bodyToSend: BodyInit =
        contentType === 'json'
          ? (customBody ?? JSON.stringify(formData))
          : (customBody ?? (formData as unknown as BodyInit));

      return await fetch(urlApi, {
        method,
        headers,
        body: bodyToSend,
      });
    };

    try {
      const initialToken = authorization ? localStorage.getItem('access_token') : null;
      let response = await enviarPeticion(initialToken);

      // Si requiere autorización y devuelve 401, refresca el token y reintenta una vez
      if (authorization && response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newAccessToken = localStorage.getItem('access_token');
          response = await enviarPeticion(newAccessToken);
        } else {
          return; // refreshToken() ya limpia storage y redirige a /Login
        }
      }

      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
      } else {
        onFailure(response);
        await errorMsg(response, eMsg);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!opc) {
    return {
      setFormData,
      formData,
      handleChange,
      handleSubmit,
      loading,
    };
  }

  return {
    setFormData,
    formData,
    handleChange,
    handleTextAreaChange,
    handleSelectChange,
    handleSubmit,
    loading,
  };
}