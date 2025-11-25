import React from 'react';
import { Link, useParams } from 'react-router-dom';

const PagoCancelado = () => {
  const { pagoId } = useParams();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg">
            <div className="card-body text-center py-5">
              {/* Icono de cancelación */}
              <div className="mb-4">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{width: '80px', height: '80px'}}>
                  <i className="fas fa-times-circle text-danger fa-3x"></i>
                </div>
                <h1 className="text-danger fw-bold">Pago Cancelado</h1>
              </div>

              {/* Mensaje */}
              <div className="mb-4">
                <p className="lead mb-3">El proceso de pago ha sido cancelado.</p>
                <p className="text-muted mb-0">
                  No se ha realizado ningún cargo. Puedes intentar nuevamente cuando lo desees.
                </p>
              </div>

              {/* Información adicional */}
              {pagoId && (
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <small className="text-muted">ID de Pago</small>
                    <p className="fw-bold mb-0">#{pagoId}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="d-grid gap-2 d-md-flex justify-content-center">
                <Link to="/pagos" className="btn btn-primary btn-lg px-4">
                  <i className="fas fa-credit-card me-2"></i>
                  Reintentar Pago
                </Link>
                <Link to="/" className="btn btn-outline-secondary btn-lg px-4">
                  <i className="fas fa-home me-2"></i>
                  Ir al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoCancelado;