import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// --- ✅ 1. IMPORTAMOS useAuth ---
import { useAuth } from '../../../hooks/useAuth';

// API
import {
  getContratoDetalle,
  aprobarContrato,
  finalizarContrato,
  descargarContratoPDF,
  getListaContratosAnticretico,
} from '../../../api/contrato/contrato';

// Iconos de Lucide
import {
  FileDown,
  Loader2,
  Check,
  X,
  ShieldAlert,
  FileText, 
  Info,     
  User,     
  Building, 
  DollarSign, 
  Calendar, 
  CheckCircle2,
  Search,
  PlusCircle,
} from 'lucide-react';

// --- Sub-componente: Spinner ---
const Spinner = ({ className = "w-5 h-5" }) => (
  <Loader2 className={`animate-spin ${className}`} />
);

// --- ❌ 2. ELIMINAMOS EL BLOQUE INCORRECTO DE AQUÍ ---
// const isAdmin = useMemo(() => ... ); // Esto estaba mal aquí

// --- Sub-componente: Alerta de Notificación ---
const Alert = ({ type = 'error', icon: Icon, children }) => {
  const baseClasses = "my-4 p-4 border rounded-lg flex items-start gap-3 animate-fade-in";
  const variants = {
    error: "bg-red-50 border-red-300 text-red-800",
    success: "bg-green-50 border-green-300 text-green-800",
  };
  const IconCmp = type === 'error' ? ShieldAlert : CheckCircle2;
  
  return (
    <div className={`${baseClasses} ${variants[type]}`}>
      <IconCmp className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span className="flex-1">{children}</span>
    </div>
  );
};

// --- Sub-componente: Distintivo de Estado ---
const EstadoBadge = ({ estado }) => {
  const estadoClasses = {
    'pendiente': 'bg-yellow-100 text-yellow-800 ring-yellow-300',
    'activo': 'bg-green-100 text-green-800 ring-green-300',
    'finalizado': 'bg-blue-100 text-blue-800 ring-blue-300',
    'cancelado': 'bg-red-100 text-red-800 ring-red-300',
  };
  const classes = estadoClasses[estado] || 'bg-gray-100 text-gray-800 ring-gray-300';
  
  return (
    <span 
      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${classes}`}
    >
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

// --- Sub-componente: Botón de Acción ---
const ActionButton = ({ onClick, disabled, loading, icon: Icon, text, loadingText, variant }) => {
  const base = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    green: "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500",
    blue: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500",
    gray: "bg-gray-600 hover:bg-gray-700 focus-visible:ring-gray-500",
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={`${base} ${variants[variant]}`}
    >
      {loading ? (
        <>
          <Spinner className="w-4 h-4" />
          {loadingText || 'Procesando...'}
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          {text}
        </>
      )}
    </button>
  );
};

// --- Sub-componente: Item de Información ---
const InfoItem = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-base font-semibold text-gray-900">{children}</dd>
    </div>
  </div>
);

// --- Sub-componente: Tarjeta de Detalles del Contrato ---
const DetalleCard = ({ contrato, onApprove, onFinalize, onDownload, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
      {/* Cabecera */}
      <div className="p-5 md:p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Detalles del Contrato
            </h3>
            <p className="text-sm text-gray-500">
              ID: {contrato.id}
            </p>
          </div>
          <EstadoBadge estado={contrato.estado} />
        </div>
      </div>
      
      {/* Cuerpo */}
      <div className="p-5 md:p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <InfoItem icon={User} label="Propietario">
            {contrato.parte_contratante_nombre} (CI: {contrato.parte_contratante_ci})
          </InfoItem>
          <InfoItem icon={User} label="Anticresista">
            {contrato.parte_contratada_nombre} (CI: {contrato.parte_contratada_ci})
          </InfoItem>
          <InfoItem icon={Building} label="Inmueble">
            {contrato.inmueble_direccion}
          </InfoItem>
          <InfoItem icon={Calendar} label="Fecha de Contrato">
            {contrato.fecha_contrato}
          </InfoItem>
          <InfoItem icon={DollarSign} label="Monto del Contrato">
            <span className="text-xl font-bold text-blue-700">
              ${parseFloat(contrato.monto).toFixed(2)}
            </span>
          </InfoItem>
        </dl>
      </div>

      {/* Pie (Acciones) */}
      <div className="p-5 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          {contrato.estado === 'pendiente' && (
            <ActionButton
              onClick={onApprove}
              disabled={loading}
              loading={loading}
              icon={Check}
              text="Aprobar Contrato"
              loadingText="Aprobando..."
              variant="green"
            />
          )}
          {contrato.estado === 'activo' && (
            <ActionButton
              onClick={onFinalize}
              disabled={loading}
              loading={loading}
              icon={X}
              text="Finalizar Contrato"
              loadingText="Finalizando..."
              variant="blue"
            />
          )}
          <ActionButton
            onClick={onDownload}
            disabled={loading}
            loading={loading}
            icon={FileDown}
            text="Descargar PDF"
            loadingText="Descargando..."
            variant="gray"
          />
        </div>
      </div>
    </div>
  );
};

// --- Sub-componente: Item de la Lista de Contratos ---
const ContratoListItem = ({ contrato, isSelected, onSelect }) => {
  const { id, estado, propietario, anticresista } = contrato;
  
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`w-full p-4 text-left border rounded-lg shadow-sm transition-all duration-150 cursor-pointer
        ${isSelected
          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
      `}
    >
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-semibold text-blue-700">ID: {id}</p>
        <EstadoBadge estado={estado} />
      </div>
      <p className="text-sm font-medium text-gray-800 truncate">
        {propietario} / {anticresista}
      </p>
    </button>
  );
};

// --- Componente Principal de la Página (Gestión) ---
export default function GestionContratoPage() {
  const navigate = useNavigate();
  
  // --- ✅ 3. MOVIMOS LA LÓGICA AQUÍ, DENTRO DEL COMPONENTE ---
  const { user } = useAuth();
  const isAdmin = useMemo(() => 
    user?.grupo_nombre?.toLowerCase() === 'administrador', 
    [user]
  );
  // --- ✅ FIN DE LA CORRECCIÓN ---

  const [listaContratos, setListaContratos] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedContratoId, setSelectedContratoId] = useState('');
  const [contratoDetalle, setContratoDetalle] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarLista();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const cargarLista = async () => {
    setLoadingList(true);
    clearMessages();
    try {
      const response = await getListaContratosAnticretico();
      setListaContratos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al cargar la lista de contratos.');
    } finally {
      setLoadingList(false);
    }
  };

  const fetchDetalle = async (id) => {
    if (!id) {
      setContratoDetalle(null);
      return;
    }
    setLoadingDetail(true);
    clearMessages();
    try {
      const response = await getContratoDetalle(id);
      setContratoDetalle(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al cargar los detalles.');
      setContratoDetalle(null);
      setSelectedContratoId(''); 
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleContratoSelect = (id) => {
    if (id === selectedContratoId) return; 
    setSelectedContratoId(id);
    fetchDetalle(id);
  };

  const handleAprobar = async () => {
    setLoadingAction(true);
    clearMessages();
    try {
      const response = await aprobarContrato(contratoDetalle.id);
      setSuccess(response.data.message);
      setContratoDetalle(response.data.contrato); 
      setListaContratos(prevList => prevList.map(c =>
        c.id === contratoDetalle.id ? { ...c, estado: 'activo' } : c
      ));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFinalizar = async () => {
    setLoadingAction(true);
    clearMessages();
    try {
      const response = await finalizarContrato(contratoDetalle.id);
      setSuccess(response.data.message);
      setContratoDetalle(prev => ({ ...prev, estado: 'finalizado' }));
      setListaContratos(prevList => prevList.map(c =>
        c.id === contratoDetalle.id ? { ...c, estado: 'finalizado' } : c
      ));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDescargar = async () => {
    setLoadingAction(true);
    clearMessages();
    try {
      const response = await descargarContratoPDF(contratoDetalle.id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato_anticretico_${contratoDetalle.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); 
    } catch (err) {
      setError(err.response?.data?.message || 'Error al descargar el PDF');
    } finally {
      setLoadingAction(false);
    }
  };

  // Esta función AHORA SÍ FUNCIONA porque 'isAdmin' está definido
  const handleGoToCreate = () => {
    const basePath = isAdmin ? '/dashboard' : '/home';
    navigate(`${basePath}/crear-contrato-anticretico`);
  };

  // Lógica de filtrado
  const filteredContratos = listaContratos.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.id.toString().includes(term) ||
      (c.propietario && c.propietario.toLowerCase().includes(term)) ||
      (c.anticresista && c.anticresista.toLowerCase().includes(term)) ||
      (c.estado && c.estado.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-100">
      
      {/* Header con el nuevo botón */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Gestión de Contratos de Anticrético
        </h2>
        
        <button
          onClick={handleGoToCreate} // Este onClick ahora es válido
          className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm transition-all duration-150 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <PlusCircle className="w-5 h-5" />
          Crear Contrato
        </button>
      </header>

      {/* Contenedor Principal (Maestro-Detalle) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
        
        {/* Columna Maestra (Lista) */}
        <aside className="lg:col-span-4 xl:col-span-3 mb-6 lg:mb-0">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Contratos Registrados
          </h3>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar por ID, nombre, estado..."
              aria-label="Buscar contratos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {loadingList ? (
            <div className="flex items-center justify-center h-48 bg-white rounded-lg shadow-sm">
              <Spinner className="w-8 h-8 text-gray-500" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
              {filteredContratos.length > 0 ? (
                filteredContratos.map(c => (
                  <ContratoListItem
                    key={c.id}
                    contrato={c}
                    isSelected={c.id === selectedContratoId}
                    onSelect={() => handleContratoSelect(c.id)}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-sm">
                  {searchTerm 
                    ? 'No se encontraron coincidencias.' 
                    : 'No hay contratos registrados.'
                  }
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Columna de Detalle */}
        <main className="lg:col-span-8 xl:col-span-9">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}
          
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-lg">
              <Spinner className="w-12 h-12 text-blue-600" />
              <p className="mt-4 text-lg text-gray-600">
                Cargando detalles...
              </p>
            </div>
          ) : contratoDetalle ? (
            <DetalleCard
              contrato={contratoDetalle}
              onApprove={handleAprobar}
              onFinalize={handleFinalizar}
              onDownload={handleDescargar}
              loading={loadingAction}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-white bg-opacity-70 border border-dashed border-gray-300 rounded-xl shadow-sm">
              <Info className="w-16 h-16 text-gray-400" />
              <h4 className="mt-4 text-xl font-semibold text-gray-700">
                Seleccione un contrato
              </h4>
              <p className="mt-1 text-gray-500">
                Elija un contrato de la lista (o búsquelo) para ver sus detalles.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}