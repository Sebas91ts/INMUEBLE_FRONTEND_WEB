// src/api/auth.js (o como se llame tu archivo)

import instancia from "../axios";

export const login = (username, password) => {
  return instancia.post('usuario/login/', { username, password });
};

export const register = (payload) => {
  return instancia.post('usuario/register', payload);
};

// --- CORRECCIÓN ---
// Ahora todas las funciones usan 'instancia'

export const requestPasswordReset = (correo) =>
  instancia.post('/usuario/recuperacion-codigo/', { correo });

export const verifyResetCode = (correo, code) =>
  instancia.post('/usuario/recuperacion-codigo-confirmar/', { correo, code });

export const setNewPassword = (correo, password) =>
  instancia.post('/usuario/recuperacion-codigo-actualizar/', { correo, password });