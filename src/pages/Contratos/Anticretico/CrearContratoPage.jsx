import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  crearContratoAnticretico,
  getAgentes,
  getInmueblesDisponibles 
} from '../../../api/contrato/contrato';
import { useAuth } from '../../../hooks/useAuth';
import { Loader2, Check, ShieldAlert, PlusCircle, UserCheck } from 'lucide-react';

// 1. IMPORTAR EL MODAL DE SAAS (Asegúrate de que la ruta sea correcta)
import SaaSModal from '../../../components/SaaSModal';

const CrearContratoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = useMemo(() => 
    user?.grupo_nombre?.toLowerCase() === 'administrador', 
    [user]
  );
  
  // Estados para los dropdowns
  const [agentes, setAgentes] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Estado del formulario
  const [formData, setFormData] = useState({
    inmueble_id: '',
    agente_id: '',
    ciudad: 'Santa Cruz',
    fecha_contrato: new Date().toISOString().split('T')[0],
    cliente_nombre: '', 
    cliente_ci: '',
    cliente_domicilio: '',
    monto: '',
    comision_porcentaje: '5',
    vigencia_meses: '12',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2. ESTADO PARA EL MODAL SAAS
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        const promesas = [getInmueblesDisponibles()];
        if (isAdmin) {
          promesas.push(getAgentes());
        }
        
        const [resInmuebles, resAgentes] = await Promise.all(promesas);
        
        if (resAgentes) {
          setAgentes(resAgentes.data.values || []); 
        }
        setInmuebles(resInmuebles.data.values.inmueble || []);

      } catch (err) {
        setError("Error al cargar datos necesarios. " + (err.response?.data?.error || err.message));
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdownData();
  }, [isAdmin]);

  useEffect(() => {
    if (user && !isAdmin) {
      setFormData(prev => ({ ...prev, agente_id: user.id }));
    }
  }, [user, isAdmin]);

  const inmueblesFiltrados = useMemo(() => 
    inmuebles.filter(i => i.tipo_operacion === 'anticretico' && i.estado === 'aprobado'), 
    [inmuebles]
  );

  const agentesFiltrados = useMemo(() => agentes, [agentes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agente_id) {
        setError("No se pudo identificar al agente. Recarga la página.");
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await crearContratoAnticretico(formData);
      setSuccess(`¡Contrato (ID: ${response.data.id}) creado exitosamente! Estado: ${response.data.estado}.`);
      setFormData({
        inmueble_id: '', 
        agente_id: isAdmin ? '' : user.id,
        ciudad: 'Santa Cruz',
        fecha_contrato: new Date().toISOString().split('T')[0],
        cliente_nombre: '', cliente_ci: '', cliente_domicilio: '',
        monto: '', comision_porcentaje: '5', vigencia_meses: '12',
      });
    } catch (err) {
      // 3. INTERCEPTAR ERROR SAAS (403)
      if (err.response && err.response.status === 403) {
          const msg = err.response.data?.error || err.response.data?.message || "Acceso denegado.";
          setUpgradeMessage(msg);
          setShowUpgradeModal(true); // <--- ABRIR MODAL
      } else {
          setError(err.response?.data?.error || err.message || 'Error desconocido al crear el contrato.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 relative">
      
      {/* 4. MODAL SAAS */}
      <SaaSModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        title="Función Premium"
        message={upgradeMessage}
        actionLabel="Actualizar Plan"
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <PlusCircle className="w-7 h-7" />
        Crear Nuevo Contrato de Anticrético
      </h2>
      
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md max-w-2xl">
        
        {loadingDropdowns ? (
           <div className="flex items-center justify-center gap-2 text-gray-500 my-10">
            <Loader2 className="animate-spin w-8 h-8" />
            Cargando datos del formulario...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label htmlFor="inmueble_id" className={labelClass}>
                Inmueble Disponible (Anticrético) <span className="text-red-500">*</span>
              </label>
              <select name="inmueble_id" id="inmueble_id" value={formData.inmueble_id} onChange={handleChange} className={inputClass} required>
                <option value="">-- Seleccionar Inmueble --</option>
                {inmueblesFiltrados.map(i => (
                  <option key={i.id} value={i.id}>
                    (ID: {i.id}) {i.titulo} - ${i.precio}
                  </option>
                ))}
              </select>
              {inmueblesFiltrados.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No hay inmuebles aprobados para anticrético.</p>
              )}
            </div>
            
            {isAdmin ? (
              <div>
                <label htmlFor="agente_id" className={labelClass}>
                  Agente que gestiona <span className="text-red-500">*</span>
                </label>
                <select name="agente_id" id="agente_id" value={formData.agente_id} onChange={handleChange} className={inputClass} required>
                  <option value="">-- Seleccionar Agente --</option>
                  {agentesFiltrados.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.username})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="agente_id" className={labelClass}>
                  Agente que gestiona
                </label>
                <div className="relative">
                  <input type="text" value={user?.nombre || `Agente ID: ${user?.id}`} className={inputClass} disabled />
                  <UserCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                </div>
              </div>
            )}

            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos del Anticresista (Cliente)</h3>
            </div>
            <div>
              <label htmlFor="cliente_nombre" className={labelClass}>Nombre del Anticresista <span className="text-red-500">*</span></label>
              <input type="text" name="cliente_nombre" id="cliente_nombre" value={formData.cliente_nombre} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="cliente_ci" className={labelClass}>CI del Anticresista <span className="text-red-500">*</span></label>
              <input type="text" name="cliente_ci" id="cliente_ci" value={formData.cliente_ci} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="cliente_domicilio" className={labelClass}>Domicilio del Anticresista</label>
              <input type="text" name="cliente_domicilio" id="cliente_domicilio" value={formData.cliente_domicilio} onChange={handleChange} className={inputClass} />
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos del Contrato</h3>
            </div>
            <div>
              <label htmlFor="monto" className={labelClass}>Monto del Anticrético ($us) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" name="monto" id="monto" value={formData.monto} onChange={handleChange} className={inputClass} required placeholder="Ej: 50000" />
            </div>
            <div>
              <label htmlFor="comision_porcentaje" className={labelClass}>Comisión del Agente (%) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" name="comision_porcentaje" id="comision_porcentaje" value={formData.comision_porcentaje} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="vigencia_meses" className={labelClass}>Vigencia (meses) <span className="text-red-500">*</span></label>
              <input type="number" name="vigencia_meses" id="vigencia_meses" value={formData.vigencia_meses} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="fecha_contrato" className={labelClass}>Fecha del Contrato <span className="text-red-500">*</span></label>
              <input type="date" name="fecha_contrato" id="fecha_contrato" value={formData.fecha_contrato} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="ciudad" className={labelClass}>Ciudad <span className="text-red-500">*</span></label>
              <input type="text" name="ciudad" id="ciudad" value={formData.ciudad} onChange={handleChange} className={inputClass} required />
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={loading || loadingDropdowns}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            {loading ? 'Creando Contrato...' : 'Crear Contrato'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default CrearContratoPage;