import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import customPin from '../assets/pin.png' // 👈 AJUSTA la ruta si tu carpeta difiere

// Ícono personalizado para el marcador
const customIcon = L.icon({
  iconUrl: customPin,
  iconSize: [40, 40],     // 🔧 ajusta a tu imagen
  iconAnchor: [20, 40],   // punta “clava” el suelo
  popupAnchor: [0, -40],
})

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onPick?.({ lat, lng })
    },
  })
  return null
}

/**
 * MapPicker
 * - value: {lat, lng}
 * - onChange: ({lat, lng}) => void
 * - height: number (px)
 */
export default function MapPicker({ value, onChange, height = 360 }) {
  const [pos, setPos] = useState(value || { lat: -16.5, lng: -68.15 })
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (value?.lat != null && value?.lng != null) setPos(value)
  }, [value])

  const round6 = (n) => Number(n.toFixed(6))
  const handlePick = ({ lat, lng }) => {
    const p = { lat: round6(lat), lng: round6(lng) }
    setPos(p)
    onChange?.(p)
  }

  const goToMyLocation = () => {
    if (!navigator.geolocation) return alert('Tu navegador no soporta geolocalización')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => handlePick({ lat: coords.latitude, lng: coords.longitude }),
      (err) => alert('No pudimos obtener tu ubicación: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
  }

  const search = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const data = await res.json()
      if (data?.length) {
        const { lat, lon } = data[0]
        handlePick({ lat: parseFloat(lat), lng: parseFloat(lon) })
      } else {
        alert('No se encontraron resultados')
      }
    } catch (err) {
      alert('Error al buscar: ' + err.message)
    }
  }

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      {/* Barra de utilidades */}
      <div className="flex flex-col gap-2 p-3 md:flex-row md:items-center bg-stone-50 border-b">
        <form onSubmit={search} className="flex-1 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar dirección o lugar (Nominatim)"
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button type="submit" className="px-3 py-2 rounded-lg bg-stone-900 text-white">
            Buscar
          </button>
        </form>
        <button
          type="button"
          onClick={goToMyLocation}
          className="px-3 py-2 rounded-lg border border-stone-300 hover:bg-stone-100"
        >
          Mi ubicación
        </button>
      </div>

      {/* Mapa */}
      <MapContainer
        center={[pos.lat, pos.lng]}
        zoom={13}
        style={{ height }}
        className="w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[pos.lat, pos.lng]} icon={customIcon} />
        <ClickHandler onPick={handlePick} />
      </MapContainer>

      <div className="p-3 text-sm text-stone-600 bg-white">
        Lat: <b>{pos.lat}</b> · Lng: <b>{pos.lng}</b> — Haz click en el mapa para mover el pin.
      </div>
    </div>
  )
}
