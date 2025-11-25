import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
// ✅ VOLVEMOS A LA API QUE SÍ FUNCIONA PARA EL MAPA
import { getInmueblesMapa } from '../../api/inmueble/mapa';

// --- 1. CONSTANTES Y ESTILOS ---
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23e2e8f0' width='300' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin Imagen%3C/text%3E%3C/svg%3E";

const Icons = {
    Navigation: () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Eye: () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Expand: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
    Compress: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>,
    GPS: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

const styles = `
  .leaflet-routing-container { display: none !important; }
  @keyframes pulse-ring { 0% { transform: scale(0.33); opacity: 1; } 80%, 100% { transform: scale(2.5); opacity: 0; } }
  .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2); }
  .leaflet-popup-content { margin: 0; width: 280px !important; }
  .leaflet-popup-close-button { color: white !important; top: 10px !important; right: 10px !important; background: rgba(0,0,0,0.3); border-radius: 50%; width: 24px !important; height: 24px !important; display: flex; justify-content: center; align-items: center; }
  .fullscreen-map { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; width: 100vw !important; height: 100vh !important; z-index: 9999; background: white; }
  button:focus { outline: none; }
`;

const createCustomIcon = (tipo) => {
    const color = tipo === 'venta' ? '#EF4444' : (tipo === 'alquiler' ? '#3B82F6' : '#10B981');
    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `<div style="width: 40px; height: 40px; display: flex; justify-content: center; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));"><div style="width: 32px; height: 32px; background-color: ${color}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white;"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%; transform: rotate(45deg);"></div></div></div>`,
        iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -42]
    });
};

const userLocationIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="position: relative; width: 24px; height: 24px;"><div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(79, 70, 229, 0.5); animation: pulse-ring 1.5s infinite;"></div><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; background-color: #4F46E5; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div></div>`,
    iconSize: [24, 24], iconAnchor: [12, 12],
});

// --- 2. COMPONENTES LÓGICOS DEL MAPA ---

// Auto-centrado
const AutoBounds = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
        }
    }, [points, map]);
    return null;
};

// Manejador de GPS (Invisible, activado por botón externo)
const GPSHandler = ({ triggerLocate, onLocationFound }) => {
    const map = useMap();
    useEffect(() => {
        if (triggerLocate) {
             if (!navigator.geolocation) return alert("Geolocalización no soportada");
             navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = [pos.coords.latitude, pos.coords.longitude];
                    map.flyTo(newPos, 16, { duration: 1.5 });
                    onLocationFound(newPos);
                },
                (err) => {
                    console.error(err);
                    alert("Por favor activa tu ubicación para usar esta función.");
                },
                { enableHighAccuracy: true }
            );
        }
    }, [triggerLocate, map, onLocationFound]);
    return null;
};

// Controlador de Rutas (Sin pines A/B)
const RoutingControl = ({ userPos, destPos, onRouteFound }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!userPos || !destPos) return;
        if (routingControlRef.current) map.removeControl(routingControlRef.current);

        const routingControl = L.Routing.control({
            waypoints: [L.latLng(userPos[0], userPos[1]), L.latLng(destPos[0], destPos[1])],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            createGeocoder: () => null,
            addWaypoints: false,
            draggableWaypoints: false,
            show: false, // Oculta panel de texto
            createMarker: function() { return null; }, // 🔥 ELIMINA PINES A/B
            lineOptions: { 
                styles: [
                    { color: 'white', opacity: 0.8, weight: 9 },
                    { color: '#4F46E5', opacity: 1, weight: 5 }
                ] 
            },
        }).addTo(map);

        routingControlRef.current = routingControl;

        routingControl.on('routesfound', function(e) {
            const summary = e.routes[0].summary;
            if (onRouteFound) onRouteFound(summary);
        });

        return () => {
            if (routingControlRef.current) {
                try { map.removeControl(routingControlRef.current); } catch (e) {}
            }
        };
    }, [map, userPos, destPos]);
    return null;
};

// --- 3. COMPONENTE PRINCIPAL ---
export default function MapaInmueblesPro() {
    const [inmuebles, setInmuebles] = useState([]);
    const [mapPoints, setMapPoints] = useState([]);
    
    // Estados de navegación
    const [userPosition, setUserPosition] = useState(null);
    const [destination, setDestination] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    
    // Estados UI
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [triggerLocate, setTriggerLocate] = useState(0);
    
    const mapContainerRef = useRef(null);

    // 🔹 Carga de datos (RESTAURADA)
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await getInmueblesMapa();
                if (data && data.values) {
                    setInmuebles(data.values);
                    const validPoints = data.values
                        .filter(i => i.latitud && i.longitud)
                        .map(i => [parseFloat(i.latitud), parseFloat(i.longitud)]);
                    setMapPoints(validPoints);
                }
            } catch (error) {
                console.error("Error al cargar mapa:", error);
            }
        };
        cargarDatos();
    }, []);

    const toggleFullscreen = () => {
        const container = mapContainerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    const handleLocateClick = () => setTriggerLocate(prev => prev + 1);

    const handleCalculateRoute = (lat, lng) => {
        const dest = [parseFloat(lat), parseFloat(lng)];
        if (!userPosition) {
            handleLocateClick(); // Primero localiza
            setTimeout(() => setDestination(dest), 1000); // Luego traza ruta
        } else {
            setDestination(dest);
        }
    };

    // 🔹 Búsqueda de Imagen (Lo mejor que podemos hacer con lo que tenemos)
    const getInmuebleImage = (inm) => {
        // Intenta encontrar cualquier campo que parezca una imagen
        if (inm.imagen_principal) return inm.imagen_principal;
        if (inm.foto_principal) return inm.foto_principal;
        if (inm.fotos_urls && inm.fotos_urls.length > 0) return inm.fotos_urls[0];
        if (inm.fotos && Array.isArray(inm.fotos) && inm.fotos.length > 0) {
             const f = inm.fotos[0];
             return typeof f === 'string' ? f : (f.url || f.foto);
        }
        // Si no hay nada, retorna el SVG local
        return FALLBACK_IMAGE;
    };

    return (
        <div className="w-full py-6 bg-gray-50 flex flex-col items-center">
             <style>{styles}</style>

             <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Explora nuestras Propiedades</h2>
                <p className="mt-2 text-gray-500">Selecciona una ubicación y encuentra el camino a tu nuevo hogar.</p>
             </div>

             <div 
                ref={mapContainerRef} 
                className={`relative w-full max-w-7xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 transition-all duration-300 ${isFullscreen ? 'fullscreen-map rounded-none border-none' : 'h-[650px]'}`}
            >
                {/* 1. LEYENDA */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 flex flex-col gap-2 text-xs font-semibold text-gray-700 pointer-events-none">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span> Venta</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span> Alquiler</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span> Anticrético</div>
                </div>

                {/* 2. BOTÓN PANTALLA COMPLETA */}
                <button 
                    onClick={toggleFullscreen}
                    className="absolute top-4 left-4 z-[1000] bg-white text-gray-700 hover:text-blue-600 p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                >
                    {isFullscreen ? <Icons.Compress /> : <Icons.Expand />}
                </button>

                {/* 3. BOTÓN GPS (LIMPIO Y SIN RECUADRO NEGRO) */}
                <button 
                    onClick={handleLocateClick}
                    className="absolute bottom-8 right-4 z-[1000] w-12 h-12 bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-xl border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 outline-none focus:outline-none"
                    title="Mi ubicación"
                >
                    <Icons.GPS />
                </button>

                {/* 4. INFO RUTA (Solo aparece al calcular) */}
                {routeInfo && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-5 animate-bounce-in border border-gray-700">
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Distancia</span>
                            <span className="text-lg font-bold">{(routeInfo.totalDistance / 1000).toFixed(1)} km</span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-600"></div>
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tiempo</span>
                            <span className="text-lg font-bold text-emerald-400">{Math.round(routeInfo.totalTime / 60)} min</span>
                        </div>
                        <button onClick={() => { setDestination(null); setRouteInfo(null); }} className="ml-2 text-gray-400 hover:text-red-400 transition-colors bg-white/10 p-1 rounded-full">
                            <Icons.Close />
                        </button>
                    </div>
                )}

                {/* 5. MAPA */}
                <MapContainer center={[-17.7833, -63.1821]} zoom={6} className="h-full w-full z-0" zoomControl={false}>
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="🗺️ Mapa Estándar">
                            <TileLayer attribution='&copy; Google' url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="🛰️ Satélite Híbrido">
                            <TileLayer attribution='&copy; Google' url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <AutoBounds points={mapPoints} />
                    <GPSHandler triggerLocate={triggerLocate} onLocationFound={setUserPosition} />
                    
                    {userPosition && destination && (
                        <RoutingControl userPos={userPosition} destPos={destination} onRouteFound={setRouteInfo} />
                    )}

                    {userPosition && <Marker position={userPosition} icon={userLocationIcon} />}

                    {/* PINES DE INMUEBLES */}
                    {inmuebles.map((inm) => (
                        inm.latitud && inm.longitud && (
                            <Marker 
                                key={inm.id} 
                                position={[parseFloat(inm.latitud), parseFloat(inm.longitud)]}
                                icon={createCustomIcon(inm.tipo_operacion)}
                            >
                                <Popup>
                                    <div className="flex flex-col font-sans group">
                                        <div className="w-full h-36 bg-gray-200 relative overflow-hidden">
                                            <img 
                                                src={getInmuebleImage(inm)} 
                                                alt={inm.titulo}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = FALLBACK_IMAGE; 
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-2 left-3 text-white">
                                                <p className="text-lg font-bold">{inm.precio} BOB</p>
                                            </div>
                                            <span className={`absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md font-bold text-white uppercase tracking-wider shadow-sm ${inm.tipo_operacion === 'venta' ? 'bg-red-500' : (inm.tipo_operacion === 'alquiler' ? 'bg-blue-500' : 'bg-emerald-500')}`}>
                                                {inm.tipo_operacion}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-white">
                                            <h3 className="text-gray-900 font-bold text-sm mb-1 leading-tight line-clamp-2">{inm.titulo}</h3>
                                            <p className="text-gray-500 text-xs mb-4">📍 {inm.direccion || "Ver detalles"}</p>
                                            <div className="flex gap-2">
                                                {/* ✅ ENLACE CORREGIDO */}
                                                <a 
                                                    href={`/home/propiedades/${inm.id}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold border border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-1"
                                                >
                                                    <Icons.Eye /> Detalles
                                                </a>
                                                <button onClick={() => handleCalculateRoute(inm.latitud, inm.longitud)} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-1">
                                                    <Icons.Navigation /> Ir Ahora
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}