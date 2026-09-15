import { fetchAuthSession } from 'aws-amplify/auth';
import { config } from './config';

export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  return fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function obtenerCatalogo(): Promise<Producto[]> {
  const response = await apiFetch('/api/productos');
  if (!response.ok) {
    throw new Error(`El backend respondio ${response.status} al pedir el catalogo`);
  }
  return response.json();
}
