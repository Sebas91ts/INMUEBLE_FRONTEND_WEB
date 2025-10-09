import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
  IdCard,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState('cliente') // Cliente o Agente
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    correo: '',
    ci: '',
    telefono: '',
    ubicacion: '',
    fecha_nacimiento: '',
    numero_licencia: '',
    experiencia: 0
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const { login, register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) clearError()
    if (successMessage) setSuccessMessage('')
  }

  const validateForm = () => {
    const newErrors = {}
    if (!isLogin) {
      if (!formData.username.trim())
        newErrors.username = 'El username es requerido'
      if (!formData.password.trim())
        newErrors.password = 'La contraseña es requerida'
      else if (formData.password.length < 3)
        newErrors.password = 'La contraseña debe tener al menos 3 caracteres'

      if (userType === 'cliente') {
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
        if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido'
        if (!formData.ci.trim()) newErrors.ci = 'El CI es requerido'
        if (!formData.telefono.trim())
          newErrors.telefono = 'El teléfono es requerido'
        if (!formData.ubicacion.trim())
          newErrors.ubicacion = 'La ubicación es requerida'
        if (!formData.fecha_nacimiento.trim())
          newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida'
      } else if (userType === 'agente') {
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
        if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido'
        if (!formData.ci.trim()) newErrors.ci = 'El CI es requerido'
        if (!formData.telefono.trim())
          newErrors.telefono = 'El teléfono es requerido'
        if (!formData.numero_licencia.trim())
          newErrors.numero_licencia = 'La licencia es requerida'
        if (!formData.experiencia && formData.experiencia !== 0)
          newErrors.experiencia = 'La experiencia es requerida'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async () => {
    if (!validateForm()) return

    const payload = {
      ...formData,
      grupo_id: !isLogin && userType === 'cliente' ? 1 : 2
    }
    const result = isLogin
      ? await login({
          username: formData.username,
          password: formData.password
        })
      : await register(payload)
    if (!isLogin) {
      if (result.success) {
        if (userType === 'cliente') {
          navigate(from, { replace: true })
        } else {
          setSuccessMessage(
            'Solicitud de agente enviada correctamente. Espera aprobación.'
          )
        }
      } else if (result.values) {
        // Mostrar errores específicos por campo
        const apiErrors = {}
        for (const key in result.values) {
          // algunos campos pueden devolver varios mensajes
          apiErrors[key] = result.values[key].join(', ')
        }
        setErrors(apiErrors)
      } else if (result.error) {
        setErrors({ general: result.error })
      }
    } else {
      if (result.success) {
        navigate(from, { replace: true })
      } else if (result.error) {
        setErrors({ general: result.error })
      }
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setFormData({
      username: '',
      password: '',
      nombre: '',
      correo: '',
      ci: '',
      telefono: '',
      ubicacion: '',
      fecha_nacimiento: '',
      numero_licencia: '',
      experiencia: 0
    })
    setUserType('cliente')
    setSuccessMessage('')
    if (error) clearError()
  }

  return (
    <div className='min-h-screen bg-white/95 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-6'>
          <div className='mx-auto w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg'>
            <Lock className='text-white' size={28} />
          </div>
          <h2 className='text-2xl font-bold text-stone-900'>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className='text-stone-600 mt-2'>
            {isLogin ? 'Bienvenido de vuelta' : 'Únete a nosotros'}
          </p>
        </div>

        {/* Switch Cliente / Agente */}
        {!isLogin && (
          <div className='flex items-center justify-center mb-6'>
            <span className='mr-3 text-sm font-medium text-stone-700'>
              Cliente
            </span>
            <button
              type='button'
              onClick={() =>
                setUserType(userType === 'cliente' ? 'agente' : 'cliente')
              }
              className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                userType === 'agente' ? 'bg-stone-900' : 'bg-gray-300'
              }`}
              disabled={loading}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  userType === 'agente' ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className='ml-3 text-sm font-medium text-stone-700'>
              Agente
            </span>
          </div>
        )}

        {/* Mensajes */}
        {error && (
          <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2'>
            <AlertCircle className='text-red-500 flex-shrink-0' size={20} />
            <span className='text-red-700 text-sm'>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm'>
            {successMessage}
          </div>
        )}

        {/* Formulario */}
        <div className='space-y-6'>
          {!isLogin && (
            <>
              {/* Nombre */}
              <div>
                <label className='block text-sm font-medium text-stone-900 mb-2'>
                  Nombre completo
                </label>
                <div className='relative'>
                  <User
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-600'
                    size={20}
                  />
                  <input
                    type='text'
                    name='nombre'
                    placeholder='Nombre completo'
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                      errors.nombre
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.nombre && (
                  <p className='text-red-500 text-sm mt-1'>{errors.nombre}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className='block text-sm font-medium text-stone-900 mb-2'>
                  Correo
                </label>
                <div className='relative'>
                  <Mail
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-600'
                    size={20}
                  />
                  <input
                    type='email'
                    name='correo'
                    placeholder='oKm0Y@example.com'
                    value={formData.correo}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                      errors.correo
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.correo && (
                  <p className='text-red-500 text-sm mt-1'>{errors.correo}</p>
                )}
              </div>

              {/* CI */}
              <div>
                <label className='block text-sm font-medium text-stone-900 mb-2'>
                  CI
                </label>
                <div className='relative'>
                  <IdCard
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-600'
                    size={20}
                  />
                  <input
                    type='text'
                    name='ci'
                    placeholder='CI'
                    value={formData.ci}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                      errors.ci
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.ci && (
                  <p className='text-red-500 text-sm mt-1'>{errors.ci}</p>
                )}
              </div>

              {/* Campos específicos */}
              {userType === 'cliente' && (
                <>
                  {/* Teléfono */}
                  <div>
                    <label className='block text-sm font-medium text-stone-900 mb-2'>
                      Teléfono
                    </label>
                    <div className='relative'>
                      <Phone
                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-600'
                        size={20}
                      />
                      <input
                        type='text'
                        name='telefono'
                        placeholder='Teléfono'
                        value={formData.telefono}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                          errors.telefono
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                    </div>
                    {errors.telefono && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.telefono}
                      </p>
                    )}
                  </div>

                  {/* Ubicación */}
                  <div>
                    <label className='block text-sm font-medium text-stone-900 mb-2'>
                      Ubicación
                    </label>
                    <input
                      type='text'
                      name='ubicacion'
                      placeholder='Santa Cruz - Bolivia'
                      value={formData.ubicacion}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-3 pr-4 py-3 border rounded-lg ${
                        errors.ubicacion
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.ubicacion && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.ubicacion}
                      </p>
                    )}
                  </div>

                  {/* Fecha de nacimiento */}
                  <div>
                    <label className='block text-sm font-medium text-stone-900 mb-2'>
                      Fecha de nacimiento
                    </label>
                    <input
                      type='date'
                      name='fecha_nacimiento'
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-3 pr-4 py-3 border rounded-lg ${
                        errors.fecha_nacimiento
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.fecha_nacimiento && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.fecha_nacimiento}
                      </p>
                    )}
                  </div>
                </>
              )}

              {userType === 'agente' && (
                <>
                  {/* Teléfono */}
                  <div>
                    <label className='block text-sm font-medium text-stone-900 mb-2'>
                      Teléfono
                    </label>
                    <input
                      type='text'
                      name='telefono'
                      value={formData.telefono}
                      placeholder='Teléfono'
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-3 pr-4 py-3 border rounded-lg ${
                        errors.telefono
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.telefono && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.telefono}
                      </p>
                    )}
                  </div>

                  {/* Número de licencia */}
                  <div>
                    <label className='block text-sm font-medium text-stone-900 mb-2'>
                      Número de licencia
                    </label>
                    <input
                      type='text'
                      name='numero_licencia'
                      value={formData.numero_licencia}
                      placeholder='Número de licencia'
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-3 pr-4 py-3 border rounded-lg ${
                        errors.numero_licencia
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.numero_licencia && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.numero_licencia}
                      </p>
                    )}
                  </div>

                  {/* Experiencia */}
                  <div>
                    <label className='block text-sm font-medium text-stone-900 mb-2'>
                      Experiencia (años)
                    </label>
                    <input
                      type='number'
                      name='experiencia'
                      placeholder='Experiencia'
                      value={formData.experiencia}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full pl-3 pr-4 py-3 border rounded-lg ${
                        errors.experiencia
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.experiencia && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.experiencia}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Username */}
          <div>
            <label className='block text-sm font-medium text-stone-900 mb-2'>
              Nombre de usuario
            </label>
            <input
              type='text'
              name='username'
              placeholder='Nombre de usuario'
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full pl-3 pr-4 py-3 border rounded-lg ${
                errors.username
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            {errors.username && (
              <p className='text-red-500 text-sm mt-1'>{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm font-medium text-stone-900 mb-2'>
              Contraseña
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-3 pr-12 py-3 border rounded-lg ${
                  errors.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-600 hover:text-stone-900'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='w-full bg-stone-900 text-white py-3 px-4 rounded-md font-medium hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:opacity-50'
          >
            {loading
              ? isLogin
                ? 'Iniciando...'
                : 'Registrando...'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Crear Cuenta'}
          </button>
        </div>

        {/* Toggle login / register */}
        <div className='mt-6 text-center'>
          <p className='text-stone-600'>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              onClick={toggleMode}
              disabled={loading}
              className='ml-2 text-stone-900 hover:text-stone-700 font-medium'
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
