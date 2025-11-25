import React, { useState } from 'react';
import ListaContratosAlquiler from '../../components/ListaContratosAlquiler';
import EstadoCuenta from '../../components/EstadoCuenta';
import VerificarPago from '../../components/VerificarPago';

const Pagos = () => {
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [pagoAVerificar, setPagoAVerificar] = useState(null);

  const handleSeleccionarContrato = (contrato) => {
    setContratoSeleccionado(contrato);
    setPagoAVerificar(null); // Resetear verificación si había una
  };

  const handleVolverALista = () => {
    setContratoSeleccionado(null);
    setPagoAVerificar(null);
  };

  const handleVerificarPago = (pagoId) => {
    setPagoAVerificar(pagoId);
  };

  if (pagoAVerificar) {
    return (
      <div className="container mt-4">
        <VerificarPago 
          pagoId={pagoAVerificar} 
          onVolver={() => setPagoAVerificar(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">💰 Gestión de Pagos</h1>
          
          {contratoSeleccionado ? (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>
                  Pagos - {contratoSeleccionado.inmueble_direccion}
                </h4>
                <button 
                  onClick={handleVolverALista}
                  className="btn btn-outline-secondary"
                >
                  ← Volver a mis contratos
                </button>
              </div>
              
              <EstadoCuenta 
                contratoId={contratoSeleccionado.id}
                onVerificarPago={handleVerificarPago}
              />
            </div>
          ) : (
            <ListaContratosAlquiler onSeleccionarContrato={handleSeleccionarContrato} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagos;