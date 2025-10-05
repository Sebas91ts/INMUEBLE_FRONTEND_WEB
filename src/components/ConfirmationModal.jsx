// components/ConfirmationModal.jsx
import React from 'react'
import { XCircle } from 'lucide-react'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-lg w-96 max-w-full p-6 relative'>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
        >
          <XCircle size={24} />
        </button>

        <h2 className='text-lg font-semibold mb-4'>Confirmación</h2>
        <p className='mb-6'>{message}</p>

        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 border rounded-lg hover:bg-gray-100'
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
