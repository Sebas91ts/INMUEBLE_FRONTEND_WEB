import React, { useState } from 'react';
import { usePagos } from '../hooks/usePagos';

const EstadoCuenta = ({ contratoId, onVerificarPago }) => {
  const { 
    estadoCuenta, 
    loading, 
    error, 
    iniciarPagoStripe,
    cargarEstadoCuenta,
    simularPagoExitoso
  } = usePagos(contratoId);

  // ✅ Estado para mensajes de éxito
  const [mensajeExito, setMensajeExito] = useState('');
  // ✅ Variable simple para desarrollo/producción
  const isDevelopment = true;

  const handlePagarStripe = async () => {
    try {
      await iniciarPagoStripe();
      // Mostrar mensaje de éxito temporal
      setMensajeExito('🔄 Redirigiendo a Stripe... Tu pago está siendo procesado.');
      setTimeout(() => setMensajeExito(''), 5000);
    } catch (err) {
      console.error('Error al iniciar pago:', err.message);
      setMensajeExito('❌ Error al procesar el pago. Intenta nuevamente.');
      setTimeout(() => setMensajeExito(''), 5000);
    }
  };

  const handleSimularPago = async () => {
    try {
      const pagoPendiente = estadoCuenta.pagos_pendientes?.[0];
      if (pagoPendiente) {
        await simularPagoExitoso(pagoPendiente.id);
        setMensajeExito('✅ ¡Pago simulado exitosamente! El estado se ha actualizado.');
        setTimeout(() => setMensajeExito(''), 5000);
      }
    } catch (err) {
      console.error('Error en simulación:', err.message);
      setMensajeExito('❌ Error en la simulación. Intenta nuevamente.');
      setTimeout(() => setMensajeExito(''), 5000);
    }
  };

  // ✅ AGREGAR ESTA FUNCIÓN QUE FALTABA
  const handleRecargar = () => {
    cargarEstadoCuenta();
    setMensajeExito(''); // Limpiar mensajes al recargar
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  if (loading && !estadoCuenta) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando estado de cuenta...</p>
        </div>
      </div>
    );
  }

  if (error && !estadoCuenta) {
    return (
      <div className="alert alert-danger alert-dismissible fade show" role="alert">
        <div className="d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <div>
            <strong>Error al cargar estado de cuenta</strong>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
        <button onClick={handleRecargar} className="btn btn-sm btn-outline-danger ms-3">
          <i className="fas fa-redo me-1"></i>
          Reintentar
        </button>
      </div>
    );
  }

  if (!estadoCuenta) return null;

  return (
    <div className="estado-cuenta">
      {/* ✅ Mensaje de éxito global */}
      {mensajeExito && (
        <div className={`alert ${mensajeExito.includes('❌') ? 'alert-danger' : mensajeExito.includes('✅') ? 'alert-success' : 'alert-info'} alert-dismissible fade show`} role="alert">
          <i className={`fas ${mensajeExito.includes('❌') ? 'fa-exclamation-circle' : mensajeExito.includes('✅') ? 'fa-check-circle' : 'fa-info-circle'} me-2`}></i>
          {mensajeExito}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMensajeExito('')}
          ></button>
        </div>
      )}

      {/* Header con información de la propiedad */}
      <div className="card bg-gradient-primary text-white mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="card-title mb-1">
                <i className="fas fa-home me-2"></i>
                {estadoCuenta.inmueble_direccion}
              </h4>
              <p className="card-text mb-0 opacity-75">
                <i className="fas fa-map-marker-alt me-1"></i>
                {estadoCuenta.inmueble_ciudad}
              </p>
            </div>
            <div className="col-md-4 text-end">
              <button onClick={handleRecargar} className="btn btn-light btn-sm">
                <i className="fas fa-sync-alt me-1"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODO DESARROLLO - Panel de Simulación (usando variable simple) */}
      {isDevelopment && estadoCuenta.pagos_pendientes?.length > 0 && (
        <div className="card border-warning mb-4">
          <div className="card-header bg-warning bg-opacity-10 border-warning">
            <h6 className="mb-0 text-warning">
              <i className="fas fa-flask me-2"></i>
              Modo Desarrollo - Simulación de Pagos
            </h6>
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <p className="mb-2 small text-muted">
                  Simula la confirmación de un pago pendiente para testing.
                </p>
                <small className="text-warning">
                  <i className="fas fa-info-circle me-1"></i>
                  Esto cambiará el estado a "confirmado" y generará un comprobante automático.
                </small>
              </div>
              <div className="col-md-4 text-end">
                <button 
                  onClick={handleSimularPago}
                  className="btn btn-warning btn-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Simulando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-1"></i>
                      Simular Pago Exitoso
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen financiero */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-money-bill-wave text-primary fa-lg"></i>
              </div>
              <h6 className="text-muted mb-1">Monto Mensual</h6>
              <h4 className="text-primary fw-bold">{formatCurrency(estadoCuenta.monto_mensual)}</h4>
              <small className="text-muted">Por mes</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-check-circle text-success fa-lg"></i>
              </div>
              <h6 className="text-muted mb-1">Total Pagado</h6>
              <h4 className="text-success fw-bold">{formatCurrency(estadoCuenta.total_pagado)}</h4>
              <small className="text-muted">{estadoCuenta.meses_pagados} mes{estadoCuenta.meses_pagados !== 1 ? 'es' : ''} pagado{estadoCuenta.meses_pagados !== 1 ? 's' : ''}</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{width: '60px', height: '60px'}}>
                <i className="fas fa-clock text-warning fa-lg"></i>
              </div>
              <h6 className="text-muted mb-1">Saldo Pendiente</h6>
              <h4 className="text-warning fw-bold">{formatCurrency(estadoCuenta.saldo_pendiente)}</h4>
              <small className="text-muted">Próximo vencimiento: {new Date(estadoCuenta.proximo_vencimiento).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de pago real */}
      {estadoCuenta.saldo_pendiente > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body text-center py-4">
            <div className="row align-items-center">
              <div className="col-md-8 text-md-start">
                <h5 className="text-dark mb-1">Realizar Pago del Mes</h5>
                <p className="text-muted mb-0">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Vence el {new Date(estadoCuenta.proximo_vencimiento).toLocaleDateString()}
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <button 
                  onClick={handlePagarStripe}
                  className="btn btn-success btn-lg px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card me-2"></i>
                      Pagar Ahora
                    </>
                  )}
                </button>
                <p className="text-muted mt-2 small">
                  Serás redirigido a Stripe para completar el pago
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de estados */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent border-0">
          <h5 className="mb-0">
            <i className="fas fa-chart-bar text-primary me-2"></i>
            Resumen de Pagos
          </h5>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-3 mb-3">
              <div className="p-3 rounded bg-success bg-opacity-10">
                <div className="h2 text-success mb-1">{estadoCuenta.resumen_estados?.confirmados || 0}</div>
                <small className="text-muted">Confirmados</small>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="p-3 rounded bg-warning bg-opacity-10">
                <div className="h2 text-warning mb-1">{estadoCuenta.resumen_estados?.pendientes || 0}</div>
                <small className="text-muted">Pendientes</small>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="p-3 rounded bg-danger bg-opacity-10">
                <div className="h2 text-danger mb-1">{estadoCuenta.resumen_estados?.fallidos || 0}</div>
                <small className="text-muted">Fallidos</small>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="p-3 rounded bg-info bg-opacity-10">
                <div className="h2 text-info mb-1">{estadoCuenta.resumen_estados?.total || 0}</div>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pagos pendientes */}
      {estadoCuenta.pagos_pendientes?.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent border-0">
            <h5 className="mb-0 text-warning">
              <i className="fas fa-clock me-2"></i>
              Pagos Pendientes
            </h5>
            {isDevelopment && (
              <small className="text-muted">Haz clic en "Simular Pago Exitoso" para probar</small>
            )}
          </div>
          <div className="card-body">
            {estadoCuenta.pagos_pendientes.map(pago => (
              <PagoItem key={pago.id} pago={pago} onVerificarPago={onVerificarPago} />
            ))}
          </div>
        </div>
      )}

      {/* Historial de pagos confirmados */}
      {estadoCuenta.pagos_confirmados?.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-transparent border-0">
            <h5 className="mb-0 text-success">
              <i className="fas fa-history me-2"></i>
              Historial de Pagos
            </h5>
          </div>
          <div className="card-body">
            {estadoCuenta.pagos_confirmados.map(pago => (
              <PagoItem key={pago.id} pago={pago} onVerificarPago={onVerificarPago} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar cada pago
const PagoItem = ({ pago, onVerificarPago }) => {
  const getEstadoConfig = (estado) => {
    const config = {
      confirmado: { 
        class: 'bg-success', 
        icon: 'fas fa-check-circle', 
        text: 'Confirmado',
        color: 'text-success'
      },
      pendiente: { 
        class: 'bg-warning', 
        icon: 'fas fa-clock', 
        text: 'Pendiente',
        color: 'text-warning'
      },
      fallido: { 
        class: 'bg-danger', 
        icon: 'fas fa-times-circle', 
        text: 'Fallido',
        color: 'text-danger'
      },
      requiere_revision: { 
        class: 'bg-info', 
        icon: 'fas fa-search', 
        text: 'En Revisión',
        color: 'text-info'
      }
    };
    return config[estado] || { class: 'bg-secondary', icon: 'fas fa-info-circle', text: estado, color: 'text-secondary' };
  };

  const getMetodoConfig = (metodo) => {
    const metodos = {
      stripe: { icon: 'fab fa-cc-stripe', text: 'Stripe', color: 'text-primary' },
      transferencia: { icon: 'fas fa-university', text: 'Transferencia', color: 'text-info' },
      qr_efectivo: { icon: 'fas fa-qrcode', text: 'QR/Efectivo', color: 'text-success' }
    };
    return metodos[metodo] || { icon: 'fas fa-money-bill', text: metodo, color: 'text-muted' };
  };

  const estadoConfig = getEstadoConfig(pago.estado);
  const metodoConfig = getMetodoConfig(pago.metodo);

  return (
    <div className="pago-item border-bottom py-3">
      <div className="row align-items-center">
        <div className="col-md-8">
          <div className="d-flex align-items-center">
            <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${estadoConfig.class} bg-opacity-10`} 
                 style={{width: '40px', height: '40px'}}>
              <i className={`${estadoConfig.icon} ${estadoConfig.color}`}></i>
            </div>
            <div>
              <div className="d-flex align-items-center mb-1">
                <span className={`badge ${estadoConfig.class} me-2`}>
                  {estadoConfig.text}
                </span>
                <strong className="h5 mb-0 text-dark">{new Intl.NumberFormat('es-BO', {
                  style: 'currency',
                  currency: 'BOB'
                }).format(pago.monto_pagado)}</strong>
              </div>
              <div className="text-muted small">
                <i className={`${metodoConfig.icon} ${metodoConfig.color} me-1`}></i>
                {metodoConfig.text} • 
                <i className="fas fa-calendar-alt ms-2 me-1"></i>
                {new Date(pago.fecha_pago).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 text-end">
          <div className="d-flex gap-2 justify-content-end">
            {pago.comprobante?.archivo_comprobante && (
              <a 
                href={pago.comprobante.archivo_comprobante} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="fas fa-file-pdf me-1"></i>
                Comprobante
              </a>
            )}
            
            {onVerificarPago && (
              <button 
                onClick={() => onVerificarPago(pago.id)}
                className="btn btn-outline-info btn-sm"
              >
                <i className="fas fa-search me-1"></i>
                Verificar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadoCuenta;