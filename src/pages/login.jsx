// src/pages/Login/login.jsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, Phone, IdCard, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Asegúrate de que la ruta a tu archivo api sea correcta y que estas funciones existan
import { requestPasswordReset, verifyResetCode, setNewPassword } from '../api/auth/login';

export default function LoginForm() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'recover1', 'recover2', 'recover3'
  const isLogin = mode === 'login';

  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('cliente');
  
  const [formData, setFormData] = useState({
    username: '', password: '', nombre: '', correo: '', ci: '',
    telefono: '', ubicacion: '', fecha_nacimiento: '',
    numero_licencia: '', experiencia: 0, recovery_code: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, register, loading: authLoading, error: authError, clearError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const loading = authLoading || localLoading;

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (authError) clearError();
    setSuccessMessage('');
  };

  // Manejador para Login y Registro
  const handleSubmit = async () => {
    // Aquí puedes añadir tu función `validateForm` si quieres ser más estricto
    const payload = { ...formData, grupo_id: userType === 'cliente' ? 1 : 2 };
    
    const result = isLogin
      ? await login({ username: formData.username, password: formData.password })
      : await register(payload);

    if (result?.success) {
      navigate(from, { replace: true });
    } else if (result?.values) { // Errores de campo específicos de la API
      const apiErrors = {};
      for (const key in result.values) {
        apiErrors[key] = result.values[key].join(', ');
      }
      setErrors(apiErrors);
    } else if (result?.error) { // Error general de la API
      setErrors({ general: result.error });
    }
  };

  // Manejador para el flujo de recuperación
  const handleRecoverySubmit = async () => {
    setLocalLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      let response;
      if (mode === 'recover1') {
        response = await requestPasswordReset(formData.correo);
        if (response.data.status === 1) {
          setSuccessMessage('Código enviado. Revisa tu correo (o la terminal del backend).');
          setMode('recover2');
        } else {
          setErrors({ general: response.data.message || 'Error al enviar el código.' });
        }
      } else if (mode === 'recover2') {
        response = await verifyResetCode(formData.correo, formData.recovery_code);
        if (response.data.status === 1) {
          setSuccessMessage('Código correcto. Ahora ingresa tu nueva contraseña.');
          setMode('recover3');
        } else {
          setErrors({ general: response.data.message || 'Código incorrecto o expirado.' });
        }
      } else if (mode === 'recover3') {
        response = await setNewPassword(formData.correo, formData.password);
        if (response.data.status === 1) {
          setSuccessMessage('¡Contraseña actualizada! Ya puedes iniciar sesión.');
          setMode('login');
        } else {
          setErrors({ general: response.data.message || 'No se pudo actualizar la contraseña.' });
        }
      }
    } catch (e) {
      setErrors({ general: e.response?.data?.message || 'Error de conexión.' });
    }
    setLocalLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setSuccessMessage('');
    clearError();
    setFormData({
      username: '', password: '', nombre: '', correo: '', ci: '',
      telefono: '', ubicacion: '', fecha_nacimiento: '',
      numero_licencia: '', experiencia: 0, recovery_code: ''
    });
  };

  return (
    <div className='min-h-screen bg-white/95 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 w-full max-w-md'>
        {/* --- HEADER --- */}
        <div className='text-center mb-6'>
          <div className='mx-auto w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg'>
            {mode.startsWith('recover') ? <KeyRound className='text-white' size={28} /> : <Lock className='text-white' size={28} />}
          </div>
          <h2 className='text-2xl font-bold text-stone-900'>
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Crear Cuenta'}
            {mode.startsWith('recover') && 'Recuperar Contraseña'}
          </h2>
          <p className='text-stone-600 mt-2'>
            {mode === 'login' && 'Bienvenido de vuelta'}
            {mode === 'register' && 'Únete a nosotros'}
            {mode.startsWith('recover') && 'Sigue los pasos para recuperar tu acceso'}
          </p>
        </div>
        
        {/* --- MENSAJES DE ERROR / ÉXITO --- */}
        {(errors.general || successMessage || authError) && (
          <div className={`mb-4 p-3 border rounded-lg text-sm flex items-center gap-2 ${errors.general || authError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errors.general || successMessage || authError}</span>
          </div>
        )}
        
        {/* --- FORMULARIO DINÁMICO --- */}
        <div className='space-y-6'>

          {/* --- VISTA DE LOGIN Y REGISTRO --- */}
          {(mode === 'login' || mode === 'register') && (
            <>
              {/* Switch Cliente / Agente (solo para registro) */}
              {mode === 'register' && (
                <div className='flex items-center justify-center'>
                  <span className='mr-3 text-sm font-medium text-stone-700'>Cliente</span>
                  <button type='button' onClick={() => setUserType(userType === 'cliente' ? 'agente' : 'cliente')} className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${userType === 'agente' ? 'bg-stone-900' : 'bg-gray-300'}`} disabled={loading}>
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${userType === 'agente' ? 'translate-x-7' : ''}`} />
                  </button>
                  <span className='ml-3 text-sm font-medium text-stone-700'>Agente</span>
                </div>
              )}
              
              {/* --- FORMULARIO DE REGISTRO COMPLETO RESTAURADO --- */}
              {mode === 'register' && (
                <>
                  {/* Nombre */}
                  <InputField icon={User} name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleInputChange} error={errors.nombre} />
                  {/* Correo */}
                  <InputField icon={Mail} name="correo" type="email" placeholder="correo@ejemplo.com" value={formData.correo} onChange={handleInputChange} error={errors.correo} />
                  {/* CI */}
                  <InputField icon={IdCard} name="ci" placeholder="CI" value={formData.ci} onChange={handleInputChange} error={errors.ci} />
                  
                  {/* Campos específicos por tipo de usuario */}
                  {userType === 'cliente' && (
                    <>
                      <InputField icon={Phone} name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleInputChange} error={errors.telefono} />
                      <InputField name="ubicacion" placeholder="Santa Cruz - Bolivia" value={formData.ubicacion} onChange={handleInputChange} error={errors.ubicacion} />
                      <InputField name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleInputChange} error={errors.fecha_nacimiento} />
                    </>
                  )}
                  {userType === 'agente' && (
                    <>
                      <InputField icon={Phone} name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleInputChange} error={errors.telefono} />
                      <InputField name="numero_licencia" placeholder="Número de licencia" value={formData.numero_licencia} onChange={handleInputChange} error={errors.numero_licencia} />
                      <InputField name="experiencia" type="number" placeholder="Experiencia (años)" value={formData.experiencia} onChange={handleInputChange} error={errors.experiencia} />
                    </>
                  )}
                </>
              )}
              
              {/* Campos comunes (Login y Registro) */}
              <InputField icon={User} name="username" placeholder="Nombre de usuario" value={formData.username} onChange={handleInputChange} error={errors.username} />
              <InputField icon={Lock} name="password" type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={formData.password} onChange={handleInputChange} error={errors.password} suffix={
                <button type='button' onClick={() => setShowPassword(!showPassword)} className="text-stone-600 hover:text-stone-900">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              } />

              {/* Botón de envío */}
              <button onClick={handleSubmit} disabled={loading} className='w-full bg-stone-900 text-white py-3 px-4 rounded-md font-medium hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:opacity-50'>
                {loading ? (isLogin ? 'Iniciando...' : 'Registrando...') : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </button>
            </>
          )}

          {/* --- VISTAS DE RECUPERACIÓN --- */}
          {mode === 'recover1' && (
            <>
              <p className="text-stone-600 text-center text-sm">Ingresa tu correo para recibir un código de recuperación.</p>
              <InputField icon={Mail} name="correo" type="email" placeholder="tu-correo@ejemplo.com" onChange={handleInputChange} error={errors.correo} />
              <button onClick={handleRecoverySubmit} disabled={loading} className='w-full bg-stone-900 text-white py-3 rounded-md font-medium hover:bg-stone-800 disabled:opacity-50'>
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </>
          )}
          {mode === 'recover2' && (
             <>
              <p className="text-stone-600 text-center text-sm">Ingresa el código que te enviamos.</p>
              <InputField icon={KeyRound} name="recovery_code" placeholder="123456" onChange={handleInputChange} error={errors.recovery_code} />
              <button onClick={handleRecoverySubmit} disabled={loading} className='w-full bg-stone-900 text-white py-3 rounded-md font-medium hover:bg-stone-800 disabled:opacity-50'>
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
            </>
          )}
          {mode === 'recover3' && (
             <>
              <p className="text-stone-600 text-center text-sm">Ingresa tu nueva contraseña.</p>
              <InputField icon={Lock} name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" onChange={handleInputChange} error={errors.password} />
              <button onClick={handleRecoverySubmit} disabled={loading} className='w-full bg-stone-900 text-white py-3 rounded-md font-medium hover:bg-stone-800 disabled:opacity-50'>
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </>
          )}
        </div>
        
        {/* --- BOTONES INFERIORES PARA CAMBIAR DE MODO --- */}
        <div className='mt-6 text-center text-sm'>
          {mode === 'login' || mode === 'register' ? (
            <>
              <p className='text-stone-600'>
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button onClick={() => switchMode(isLogin ? 'register' : 'login')} disabled={loading} className='ml-1 text-stone-900 font-medium hover:underline'>
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
              {isLogin && (
                <p className="mt-2">
                  <button onClick={() => switchMode('recover1')} disabled={loading} className="text-stone-900 font-medium hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </p>
              )}
            </>
          ) : (
            <p className="mt-2">
              <button onClick={() => switchMode('login')} disabled={loading} className="text-stone-900 font-medium hover:underline">
                Volver a Iniciar Sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para abstraer la lógica de los campos de texto
function InputField({ icon: Icon, name, type, placeholder, value, onChange, error, suffix }) {
  const hasError = !!error;
  return (
    <div>
      <label className='block text-sm font-medium text-stone-900 mb-2'>{placeholder}</label>
      <div className='relative'>
        {Icon && <Icon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500' size={20} />}
        <input
          type={type || 'text'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full py-3 border rounded-lg ${Icon ? 'pl-11' : 'pl-4'} ${suffix ? 'pr-11' : 'pr-4'} ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
        />
        {suffix && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{suffix}</div>}
      </div>
      {hasError && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
}