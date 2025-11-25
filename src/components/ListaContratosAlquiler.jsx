import React from 'react';
import { useContratos } from '../hooks/useContratos';

const ListaContratosAlquiler = ({ onSeleccionarContrato }) => {
  const { contratos, count, loading, error, cargarContratosAlquiler } = useContratos();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Buscando tus contratos de alquiler...</p>
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
            <strong>Error al cargar contratos</strong>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
        <button 
          onClick={cargarContratosAlquiler} 
          className="btn btn-sm btn-outline-danger ms-3"
        >
          <i className="fas fa-redo me-1"></i>
          Reintentar
        </button>
      </div>
    );
  }

  const getEstadoConfig = (estado) => {
    const config = {
      activo: { class: 'bg-success', icon: 'fas fa-check-circle', text: 'Activo' },
      finalizado: { class: 'bg-secondary', icon: 'fas fa-flag-checkered', text: 'Finalizado' },
      cancelado: { class: 'bg-danger', icon: 'fas fa-times-circle', text: 'Cancelado' },
      pendiente: { class: 'bg-warning', icon: 'fas fa-clock', text: 'Pendiente' }
    };
    return config[estado] || { class: 'bg-info', icon: 'fas fa-info-circle', text: estado };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  return (
    <div className="lista-contratos">
      {/* Header con estadísticas */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h4 mb-1 fw-bold text-dark">
                <i className="fas fa-file-contract text-primary me-2"></i>
                Mis Contratos de Alquiler
              </h2>
              <p className="text-muted mb-0">Gestiona tus propiedades en alquiler</p>
            </div>
            {count > 0 && (
              <div className="text-end">
                <span className="badge bg-primary fs-6 px-3 py-2">
                  <i className="fas fa-home me-1"></i>
                  {count} contrato{count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {contratos.length === 0 ? (
        <div className="text-center py-5">
          <div className="empty-state">
            <i className="fas fa-file-contract fa-4x text-muted mb-3"></i>
            <h4 className="text-muted">No tienes contratos de alquiler</h4>
            <p className="text-muted mb-4">Actualmente no cuentas con propiedades en alquiler.</p>
            <button className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Crear primer contrato
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {contratos.map(contrato => {
            const estadoConfig = getEstadoConfig(contrato.estado);
            
            return (
              <div key={contrato.id} className="col-xl-6 col-lg-12">
                <div 
                  className="card contract-card h-100 shadow-sm border-0 hover-shadow transition-all"
                  onClick={() => onSeleccionarContrato && onSeleccionarContrato(contrato)}
                  style={{ 
                    cursor: onSeleccionarContrato ? 'pointer' : 'default',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="card-header bg-transparent border-0 pb-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1 text-dark fw-bold">
                          <i className="fas fa-building text-primary me-2"></i>
                          {contrato.inmueble_direccion}
                        </h5>
                        <p className="text-muted mb-2 small">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {contrato.inmueble_ciudad}
                        </p>
                      </div>
                      <span className={`badge ${estadoConfig.class} px-3 py-2`}>
                        <i className={`${estadoConfig.icon} me-1`}></i>
                        {estadoConfig.text}
                      </span>
                    </div>
                  </div>

                  <div className="card-body pt-3">
                    {/* Información del contrato */}
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-2">
                            <i className="fas fa-money-bill-wave text-success"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Monto mensual</small>
                            <strong className="text-dark">{formatCurrency(contrato.monto)}</strong>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-2">
                            <i className="fas fa-calendar-alt text-primary"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Duración</small>
                            <strong className="text-dark">{contrato.vigencia_meses} meses</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="timeline-dates mb-3">
                      <div className="d-flex justify-content-between align-items-center text-sm">
                        <div className="text-center">
                          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-1" 
                               style={{width: '32px', height: '32px'}}>
                            <i className="fas fa-play fa-xs"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Inicio</small>
                            <strong>{new Date(contrato.fecha_inicio).toLocaleDateString()}</strong>
                          </div>
                        </div>
                        
                        <div className="flex-grow-1 mx-2">
                          <div className="progress" style={{height: '4px'}}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{width: '50%'}}
                            ></div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-1" 
                               style={{width: '32px', height: '32px'}}>
                            <i className="fas fa-flag fa-xs"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Fin</small>
                            <strong>{contrato.fecha_fin ? new Date(contrato.fecha_fin).toLocaleDateString() : 'Indefinido'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="d-flex gap-2 mt-4">
                      {contrato.archivo_pdf && (
                        <a 
                          href={contrato.archivo_pdf} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm flex-fill"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-file-pdf me-2"></i>
                          Ver Contrato
                        </a>
                      )}
                      
                      {onSeleccionarContrato && (
                        <button 
                          className="btn btn-primary btn-sm flex-fill"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeleccionarContrato(contrato);
                          }}
                        >
                          <i className="fas fa-eye me-2"></i>
                          Ver Detalles
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .contract-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;
        }
        
        .hover-shadow {
          box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
        
        .empty-state {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default ListaContratosAlquiler;