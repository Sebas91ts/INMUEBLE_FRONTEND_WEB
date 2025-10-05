import React, { createContext, useReducer, useEffect } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth/login'
// Estados de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null
      }

    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: action.payload
      }

    case 'REFRESH_TOKEN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      }

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null
      }

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Estado inicial
// Ver si hay datos guardados en localStorage
const storedAuth = localStorage.getItem('authData')
const initialState = {
  isAuthenticated: storedAuth ? true : false,
  user: storedAuth ? JSON.parse(storedAuth).user : null,
  accessToken: storedAuth ? JSON.parse(storedAuth).accessToken : null,
  refreshToken: storedAuth ? JSON.parse(storedAuth).refreshToken : null,
  loading: false, // si hay datos, ya no está "cargando"
  error: null
}

// Crear contexto
export const AuthContext = createContext()

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAuth = localStorage.getItem('authData')
        if (storedAuth) {
          const { user, accessToken } = JSON.parse(storedAuth)

          // Verificar si el token no ha expirado
          if (isTokenValid(accessToken)) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, accessToken }
            })
          } else {
            // Limpiar datos inválidos
            localStorage.removeItem('authData')
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error)
        localStorage.removeItem('authData')
      }
    }

    loadStoredAuth()
  }, [])

  // Guardar en localStorage cuando cambie el estado de auth
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.accessToken) {
      const authData = {
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }
      localStorage.setItem('authData', JSON.stringify(authData))
    } else {
      localStorage.removeItem('authData')
    }
  }, [state.isAuthenticated, state.user, state.accessToken, state.refreshToken])

  // Verificar si el token es válido
  const isTokenValid = (token) => {
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      return false
    }
  }
  // Login
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiLogin(
        credentials.username,
        credentials.password
      )
      const values = response.data.values

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: values.usuario.id,
            nombre: values.usuario.nombre,
            username: values.usuario.username,
            correo: values.usuario.correo,
            grupo_id: values.usuario.grupo_id,
            grupo_nombre: values.usuario.grupo_nombre,
            ci: values.usuario.ci,
            telefono: values.usuario.telefono,
            ubicacion: values.usuario.ubicacion,
            fecha_nacimiento: values.usuario.fecha_nacimiento,
            is_active: values.usuario.is_active,
            is_staff: values.usuario.is_staff
          },
          accessToken: values.token
        }
      })

      return { success: true, data: values }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || error.message
      })
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  // Registro
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiRegister(
        userData.username,
        userData.password,
        userData.nombre,
        userData.correo,
        userData.ci,
        userData.telefono,
        userData.ubicacion,
        userData.fecha_nacimiento
      )

      const { values } = response.data // 👈 extraemos values directo

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: values.usuario.id,
            nombre: values.usuario.nombre,
            username: values.usuario.username,
            correo: values.usuario.correo,
            grupo_id: values.usuario.grupo_id,
            ci: values.usuario.ci,
            telefono: values.usuario.telefono,
            ubicacion: values.usuario.ubicacion,
            fecha_nacimiento: values.usuario.fecha_nacimiento,
            is_active: values.usuario.is_active,
            is_staff: values.usuario.is_staff
          },
          accessToken: values.token
        }
      })

      return { success: true, data: values }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || error.message
      })
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  // Logout
  const logout = async () => {
    try {
      // Si tu backend tiene un endpoint para invalidar token, aquí lo llamas
      // await apiLogout(state.accessToken)

      // Elimina del localStorage
      localStorage.removeItem('authData')

      // Limpia el estado global
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  // Actualizar información del usuario
  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
  }

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Interceptor para requests automáticos con token
  const authenticatedFetch = async (url, options = {}) => {
    let token = state.accessToken

    if (!token) {
      throw new Error('No valid token available')
    }

    const authenticatedOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const response = await fetch(url, authenticatedOptions)

    return response
  }

  const value = {
    // Estado
    ...state,

    // Acciones
    login,
    logout,
    register,
    updateUser,
    clearError,
    authenticatedFetch,

    // Utilidades
    isTokenValid
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
