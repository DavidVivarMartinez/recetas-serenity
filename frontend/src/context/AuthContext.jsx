import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth';
import { authApi, guardarToken, obtenerToken } from '../services/api';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(() => Boolean(obtenerToken()));

  // Al arrancar, si hay token guardado, recuperar el usuario
  useEffect(() => {
    if (!obtenerToken()) return;
    authApi
      .yo()
      .then(setUsuario)
      .catch(() => guardarToken(null))
      .finally(() => setCargando(false));
  }, []);

  // Si la API responde 401 con un token, la sesión ha caducado
  useEffect(() => {
    const cerrar = () => setUsuario(null);
    window.addEventListener('serenity:sesion-caducada', cerrar);
    return () => window.removeEventListener('serenity:sesion-caducada', cerrar);
  }, []);

  const login = useCallback(async (credenciales) => {
    const r = await authApi.login(credenciales);
    guardarToken(r.token);
    setUsuario(r.usuario);
    return r.usuario;
  }, []);

  const registro = useCallback(async (datos) => {
    const r = await authApi.registro(datos);
    guardarToken(r.token);
    setUsuario(r.usuario);
    return r.usuario;
  }, []);

  const logout = useCallback(() => {
    guardarToken(null);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      esAdmin: usuario?.rol === 'admin',
      login,
      registro,
      logout,
      setUsuario,
    }),
    [usuario, cargando, login, registro, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
