// Cliente HTTP para la API de Recetas Serenity.
// En desarrollo Vite redirige /api al backend (ver vite.config.js).
const BASE = import.meta.env.VITE_API_URL || '/api';
const CLAVE_TOKEN = 'serenity_token';

export function obtenerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    else localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    /* almacenamiento no disponible */
  }
}

export class ApiError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

async function peticion(ruta, { method = 'GET', body, params, auth = true } = {}) {
  const url = new URL(BASE + ruta, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') url.searchParams.set(k, v);
    });
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? obtenerToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. ¿Está arrancado el backend?');
  }

  if (res.status === 204) return null;
  const datos = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) {
      guardarToken(null);
      window.dispatchEvent(new Event('serenity:sesion-caducada'));
    }
    throw new ApiError(res.status, datos.error || `Error ${res.status}`, datos.detalles);
  }
  return datos;
}

export const authApi = {
  registro: (datos) => peticion('/auth/registro', { method: 'POST', body: datos, auth: false }),
  login: (datos) => peticion('/auth/login', { method: 'POST', body: datos, auth: false }),
  yo: () => peticion('/auth/yo'),
};

export const recetasApi = {
  listar: (params) => peticion('/recetas', { params }),
  obtener: (id) => peticion(`/recetas/${id}`),
  categorias: () => peticion('/recetas/categorias'),
  etiquetas: () => peticion('/recetas/etiquetas'),
  dificultades: () => peticion('/recetas/dificultades'),
  mias: () => peticion('/recetas/mias'),
  favoritas: () => peticion('/recetas/favoritas'),
  crear: (datos) => peticion('/recetas', { method: 'POST', body: datos }),
  actualizar: (id, datos) => peticion(`/recetas/${id}`, { method: 'PUT', body: datos }),
  eliminar: (id) => peticion(`/recetas/${id}`, { method: 'DELETE' }),
  toggleFavorito: (id) => peticion(`/recetas/${id}/favorito`, { method: 'POST' }),
  valorar: (id, datos) => peticion(`/recetas/${id}/valoracion`, { method: 'PUT', body: datos }),
  quitarValoracion: (id) => peticion(`/recetas/${id}/valoracion`, { method: 'DELETE' }),
};

export const alimentosApi = {
  listar: (params) => peticion('/alimentos', { params }),
  obtener: (id) => peticion(`/alimentos/${id}`),
  categorias: () => peticion('/alimentos/categorias'),
  crear: (datos) => peticion('/alimentos', { method: 'POST', body: datos }),
};

export const usuariosApi = {
  perfil: (id) => peticion(`/usuarios/${id}`),
  actualizarYo: (datos) => peticion('/usuarios/yo', { method: 'PATCH', body: datos }),
};

export const estadisticasApi = {
  obtener: () => peticion('/estadisticas', { auth: false }),
};

// ---------- utilidades de presentación ----------
export function formatearTiempo(min) {
  if (min == null) return '';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatearCantidad(cantidad, unidad) {
  if (cantidad == null) return unidad || '';
  const n = Math.round(cantidad * 100) / 100;
  const texto = Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
  return unidad ? `${texto} ${unidad}` : texto;
}

export function formatearFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
