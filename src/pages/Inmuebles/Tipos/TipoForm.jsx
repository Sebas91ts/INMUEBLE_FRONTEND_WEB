// src/pages/Inmuebles/Tipos/TipoForm.jsx
import { useEffect, useState } from 'react'

export default function TipoForm({ initial, onSubmit, onCancel, loading }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  useEffect(() => {
    setNombre(initial?.nombre || '')
    setDescripcion(initial?.descripcion || '')
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ nombre, descripcion })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      <div>
        <label className='block text-sm font-medium'>Nombre</label>
        <input
          className='mt-1 w-full rounded border px-3 py-2'
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div>
        <label className='block text-sm font-medium'>Descripción</label>
        <textarea
          className='mt-1 w-full rounded border px-3 py-2'
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />
      </div>

      <div className='flex gap-2 justify-end pt-2'>
        <button type='button' onClick={onCancel} className='px-3 py-2 rounded border'>
          Cancelar
        </button>
        <button
          type='submit'
          disabled={loading}
          className='px-3 py-2 rounded bg-stone-900 text-white disabled:opacity-50'
        >
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
