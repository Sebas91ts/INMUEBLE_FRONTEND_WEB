import React, { useState, useEffect } from 'react';
import { pagosAPI } from '../api/pago_alquiler/pago_alquiler';

const VerificarPago = ({ pagoId, onVolver }) => {
  const [pagoInfo, setPagoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEstadoPago = async () => {
    try {
      setLoading(true);
      const response = await pagosAPI.verificarEstadoPago(pagoId);
      setPagoInfo(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar pago');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pagoId) {
      cargarEstadoPago();
    }
  }, [pagoId]);

  // Polling automático para pagos pendientes
  useEffect(() => {
    let interval;
    
    if (pagoInfo?.pago?.estado === 'pendiente') {
      interval = setInterval(() => {
        cargarEstadoPago();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pagoInfo?.pago?.estado]);

  const getEstadoConfig = (estado) => {
    const config = {
      confirmado: { 
        class: 'border-success bg-success bg-opacity-10', 
        icon: 'fas fa-check-circle text-success',
        title: 'Pago Confirmado'
      },
      pendiente: { 
        class: 'border-warning bg-warning bg-opacity-10', 
        icon: 'fas fa-clock text-warning',
        title: 'Pago Pendiente'
      },
      fallido: { 
        class: 'border-danger bg-danger bg-opacity-10', 
        icon: 'fas fa-times-circle text-danger',
        title: 'Pago Fallido'
      },
      requiere_revision: { 
        class: 'border-info bg-info bg-opacity-10', 
        icon: 'fas fa-search text-info',
        title: 'En Revisión'
      }
    };
    return config[estado] || { class: 'border-secondary', icon: 'fas fa-info-circle', title: 'Estado Desconocido' };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Verificando...</span>
          </div>
          <p className="text-muted">Verificando estado del pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger alert-dismissible fade show" role="alert">
        <div className="d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <div>
            <strong>Error al verificar pago</strong>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
        <div className="mt-2">
          <button onClick={cargarEstadoPago} className="btn btn-sm btn-outline-danger me-2">
            <i className="fas fa-redo me-1"></i>
            Reintentar
          </button>
          {onVolver && (
            <button onClick={onVolver} className="btn btn-sm btn-secondary">
              <i className="fas fa-arrow-left me-1"></i>
              Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!pagoInfo) return null;

  const { pago, estado_detallado, tiempo_transcurrido } = pagoInfo;
  const estadoConfig = getEstadoConfig(pago.estado);

  return (
    <div className="verificar-pago">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-dark mb-1">
            <i className="fas fa-receipt text-primary me-2"></i>
            Verificación de Pago
          </h4>
          <p className="text-muted mb-0">ID: #{pagoId}</p>
        </div>
        {onVolver && (
          <button onClick={onVolver} className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-1"></i>
            Volver
          </button>
        )}
      </div>

      {/* Tarjeta de estado principal */}
      <div className={`card ${estadoConfig.class} border-3 mb-4`}>
        <div className="card-body text-center py-4">
          <div className="mb-3">
            <i className={`${estadoConfig.icon} fa-4x`}></i>
          </div>
          <h3 className="card-title mb-2">{estadoConfig.title}</h3>
          <p className="card-text text-muted">{estado_detallado.mensaje}</p>
        </div>
      </div>

      {/* Detalles del pago */}
      <div className="row">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0">
              <h6 className="mb-0">
                <i className="fas fa-info-circle text-primary me-2"></i>
                Información del Pago
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted d-block">Monto</small>
                <strong className="h5 text-dark">
                  {new Intl.NumberFormat('es-BO', {
                    style: 'currency',
                    currency: 'BOB'
                  }).format(pago.monto_pagado)}
                </strong>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">Método de Pago</small>
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">
                    {pago.metodo === 'stripe' && <i className="fab fa-cc-stripe me-1"></i>}
                    {pago.metodo === 'transferencia' && <i className="fas fa-university me-1"></i>}
                    {pago.metodo === 'qr_efectivo' && <i className="fas fa-qrcode me-1"></i>}
                    {pago.metodo}
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">Fecha y Hora</small>
                <strong>{new Date(pago.fecha_pago).toLocaleString('es-ES')}</strong>
              </div>
              
              <div>
                <small className="text-muted d-block">Tiempo Transcurrido</small>
                <strong>{tiempo_transcurrido}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0">
              <h6 className="mb-0">
                <i className="fas fa-list-check text-primary me-2"></i>
                Próximos Pasos
              </h6>
            </div>
            <div className="card-body">
              {estado_detallado.siguientes_pasos ? (
                <ul className="list-unstyled mb-0">
                  {estado_detallado.siguientes_pasos.map((paso, index) => (
                    <li key={index} className="mb-2 d-flex align-items-start">
                      <i className="fas fa-chevron-right text-primary mt-1 me-2"></i>
                      <span>{paso}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">No hay acciones pendientes.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="text-center mt-4">
        <button onClick={cargarEstadoPago} className="btn btn-primary px-4">
          <i className="fas fa-sync-alt me-2"></i>
          Actualizar Estado
        </button>
      </div>
    </div>
  );
};

export default VerificarPago;