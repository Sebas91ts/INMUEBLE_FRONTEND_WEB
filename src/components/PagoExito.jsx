import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const PagoExito = () => {
  const { pagoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pagoInfo, setPagoInfo] = useState(null);

  useEffect(() => {
    const cargarInfoPago = async () => {
      try {
        // Aquí podrías llamar a tu API para verificar el pago
        // const response = await pagosAPI.verificarPago(pagoId);
        
        // Simulamos carga exitosa
        setTimeout(() => {
          setPagoInfo({
            id: pagoId,
            estado: 'confirmado',
            monto: '1500.00',
            fecha: new Date().toISOString()
          });
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error cargando pago:', error);
        setLoading(false);
      }
    };

    if (pagoId) {
      cargarInfoPago();
    }
  }, [pagoId]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h4>Verificando tu pago...</h4>
            <p className="text-muted">Estamos confirmando el estado de tu transacción.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg">
            <div className="card-body text-center py-5">
              {/* Icono de éxito */}
              <div className="mb-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{width: '80px', height: '80px'}}>
                  <i className="fas fa-check-circle text-success fa-3x"></i>
                </div>
                <h1 className="text-success fw-bold">¡Pago Exitoso!</h1>
              </div>

              {/* Información del pago */}
              <div className="mb-4">
                <p className="lead mb-3">Tu pago ha sido procesado exitosamente.</p>
                
                <div className="card bg-light border-0 mb-3">
                  <div className="card-body">
                    <div className="row text-start">
                      <div className="col-6">
                        <small className="text-muted">ID de Pago</small>
                        <p className="fw-bold mb-0">#{pagoId}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Estado</small>
                        <p className="fw-bold mb-0">
                          <span className="badge bg-success">Confirmado</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="d-grid gap-2 d-md-flex justify-content-center">
                <Link to="/pagos" className="btn btn-primary btn-lg px-4">
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver a Pagos
                </Link>
                <Link to="/" className="btn btn-outline-secondary btn-lg px-4">
                  <i className="fas fa-home me-2"></i>
                  Ir al Inicio
                </Link>
              </div>

              {/* Información adicional */}
              <div className="mt-4">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Recibirás un comprobante por email y podrás verlo en tu historial de pagos.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoExito;