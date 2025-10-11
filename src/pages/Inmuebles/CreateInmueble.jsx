// src/pages/Inmuebles/CreateInmueble.jsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { listarTiposInmueble, crearInmueble } from "../../api/inmueble";
import { uploadImageToCloudinary } from "../../api/uploader";
import { useAuth } from "../../hooks/useAuth";
import { getAgentes, getUsuarios } from "../../api/usuarios/usuarios";

// ============ MapPicker embebido (sin buscador) ============
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

function MapPicker({ value, onChange, height = 360 }) {
  // 🗺️ Santa Cruz por defecto
  const [pos, setPos] = useState(value || { lat: -17.7833, lng: -63.1821 });

  useEffect(() => {
    if (value?.lat && value?.lng) setPos(value);
  }, [value]);

  const round6 = (n) => Number(n.toFixed(6));
  const handlePick = ({ lat, lng }) => {
    const p = { lat: round6(lat), lng: round6(lng) };
    setPos(p);
    onChange?.(p);
  };

  const goToMyLocation = () => {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => handlePick({ lat: coords.latitude, lng: coords.longitude }),
      (err) => alert("No pudimos obtener tu ubicación: " + err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
  };

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      {/* Barra superior: solo Mi ubicación */}
      <div className="flex justify-end p-3 bg-stone-50 border-b">
        <button
          type="button"
          onClick={goToMyLocation}
          className="px-4 py-2 rounded-lg border bg-blue-500 bg-blue-500 text-white hover:bg-stone-800 transition-colors"
        >
          📍 Mi ubicación
        </button>
      </div>

      {/* Mapa */}
      <MapContainer center={[pos.lat, pos.lng]} zoom={13} style={{ height }} className="w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[pos.lat, pos.lng]} />
        <ClickHandler onPick={handlePick} />
      </MapContainer>

      <div className="p-3 text-sm text-stone-600 bg-white">
        Lat: <b>{pos.lat}</b> · Lng: <b>{pos.lng}</b> — Haz click en el mapa para mover el pin.
      </div>
    </div>
  );
}

// ============ Página principal ============
export default function CreateInmueble() {
  const { user } = useAuth();
  const isAdmin = String(user?.grupo_nombre || "").toLowerCase() === "administrador";

  // formulario (strings para inputs; parseo al enviar)
  const [form, setForm] = useState({
    agente: "", // requerido si admin
    cliente: "", // opcional
    tipo_inmueble_id: "1",
    titulo: "",
    descripcion: "",
    direccion: "",
    ciudad: "Santa Cruz",
    zona: "",
    superficie: "0",
    dormitorios: "0",
    banos: "0", // se mapeará a ["baños"]
    precio: "0",
    tipo_operacion: "venta",
    latitud: "-17.7833",
    longitud: "-63.1821",
  });

  const [tipos, setTipos] = useState([]);
  const [agentes, setAgentes] = useState([]); // [{id,label}]
  const [clientes, setClientes] = useState([]); // [{id,label}]
  const [err, setErr] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [ok, setOk] = useState(null);
  const [saving, setSaving] = useState(false);

  // subida de fotos (opcional)
  const [items, setItems] = useState([]); // [{name,previewUrl,status,progress,urlFinal,_file}]
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    // Tipos de inmueble
    listarTiposInmueble()
      .then((arr) => {
        const list = Array.isArray(arr) ? arr : arr?.values?.tipo_inmueble || [];
        setTipos(list);
        if (list.length && !form.tipo_inmueble_id) {
          setForm((s) => ({ ...s, tipo_inmueble_id: String(list[0].id) }));
        }
      })
      .catch(() => setTipos([]));

    // Agentes & Usuarios (clientes)
    (async () => {
      try {
        const [agtsRes, usersRes] = await Promise.all([getAgentes(), getUsuarios()]);
        const arrAgts = agtsRes?.data?.values || agtsRes?.data || [];
        const arrUsers =
          usersRes?.data?.values?.usuarios || usersRes?.data?.values || usersRes?.data || [];

        const agts = (Array.isArray(arrAgts) ? arrAgts : []).map((a) => ({
          id: a.id,
          label: a.nombre_completo || a.username || `Agente #${a.id}`,
        }));

        const clients = (Array.isArray(arrUsers) ? arrUsers : [])
          .filter((u) => String(u.grupo_nombre || u.grupo?.nombre || "").toLowerCase() === "cliente")
          .map((c) => ({
            id: c.id,
            label: c.nombre_completo || c.username || `Cliente #${c.id}`,
          }));

        setAgentes(agts);
        setClientes(clients);
      } catch {
        setAgentes([]);
        setClientes([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // fotos (opcional)
  // fotos (opcional)
  const onPickFiles = async (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const nuevos = files.map((f) => ({
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      status: "subiendo",
      progress: 0,
      urlFinal: null,
      _file: f,
    }));
    setItems((prev) => [...prev, ...nuevos]);

    setSubiendo(true);
    await Promise.all(
      nuevos.map(async (it, idxLocal) => {
        const idx = items.length + idxLocal;
        try {
          const url = await uploadImageToCloudinary(it._file, (p) => {
            setItems((prev) => {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], progress: p };
              return copy;
            });
          });
          setItems((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], status: "ok", progress: 100, urlFinal: url };
            return copy;
          });
        } catch {
          setItems((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], status: "error" };
            return copy;
          });
        }
      })
    );
    setSubiendo(false);
    e.target.value = "";
  };


  const removeFoto = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const fotosUrls = useMemo(
    () => items.filter((x) => x.status === "ok" && x.urlFinal).map((x) => x.urlFinal),
    [items]
  );

  const stopWheel = (e) => e.currentTarget.blur();

  // ===== Validaciones =====
  const validations = () => {
    const fe = {};
    const req = (v) => String(v ?? "").trim().length > 0;

    // Requeridos
    if (isAdmin && !req(form.agente)) fe.agente = "Selecciona un agente.";
    if (!req(form.tipo_inmueble_id)) fe.tipo_inmueble_id = "Selecciona tipo de inmueble.";
    if (!req(form.titulo)) fe.titulo = "El título es obligatorio.";
    if (!req(form.descripcion)) fe.descripcion = "La descripción es obligatoria.";
    if (!req(form.direccion)) fe.direccion = "La dirección es obligatoria.";
    if (!req(form.ciudad)) fe.ciudad = "La ciudad es obligatoria.";
    if (!req(form.precio)) fe.precio = "El precio es obligatorio.";

    // Números
    const toInt = (s) =>
      s === "" || s === null || s === undefined ? null : parseInt(s, 10);
    const toFloat = (s) =>
      s === "" || s === null || s === undefined ? null : parseFloat(s);

    const superficie = toFloat(form.superficie);
    const dormitorios = toInt(form.dormitorios);
    const banos = toInt(form.banos);
    const precio = toFloat(form.precio);
    const lat = toFloat(form.latitud);
    const lng = toFloat(form.longitud);

    if (precio === null || isNaN(precio) || precio < 0) fe.precio = "Precio inválido (≥ 0).";
    if (superficie !== null && (isNaN(superficie) || superficie < 0))
      fe.superficie = "Superficie inválida (≥ 0).";
    if (dormitorios !== null && (isNaN(dormitorios) || dormitorios < 0))
      fe.dormitorios = "Dormitorios inválidos (entero ≥ 0).";
    if (banos !== null && (isNaN(banos) || banos < 0))
      fe.banos = "Baños inválidos (entero ≥ 0).";

    if (lat === null || isNaN(lat) || lat < -90 || lat > 90)
      fe.latitud = "Latitud inválida (-90 a 90).";
    if (lng === null || isNaN(lng) || lng < -180 || lng > 180)
      fe.longitud = "Longitud inválida (-180 a 180).";

    return fe;
  };

  const disabledSubmit = saving || subiendo;

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setFieldErrors(null);
    setFieldErrors(null);

    const fe = validations();
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setErr("Revisa los campos marcados.");
      return;
    }

    setSaving(true);
    try {
      const toInt = (s) =>
        s === "" || s === null || s === undefined ? null : parseInt(s, 10);
      const toFloat = (s) =>
        s === "" || s === null || s === undefined ? null : parseFloat(s);

      const payload = {
        ...(isAdmin && form.agente ? { agente: toInt(form.agente) } : {}),
        ...(form.cliente ? { cliente: toInt(form.cliente) } : {}),
        ...(isAdmin && form.agente ? { agente: toInt(form.agente) } : {}),
        ...(form.cliente ? { cliente: toInt(form.cliente) } : {}),
        tipo_inmueble_id: toInt(form.tipo_inmueble_id),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
        zona: form.zona.trim(),
        superficie: toFloat(form.superficie),
        dormitorios: toInt(form.dormitorios),
        ["baños"]: toInt(form.banos), // backend espera 'baños'
        ["baños"]: toInt(form.banos), // backend espera 'baños'
        precio: toFloat(form.precio),
        tipo_operacion: form.tipo_operacion,
        latitud: toFloat(form.latitud),
        longitud: toFloat(form.longitud),
        ...(fotosUrls.length ? { fotos_urls: fotosUrls } : {}),
        ...(fotosUrls.length ? { fotos_urls: fotosUrls } : {}),
      };

      const res = await crearInmueble(payload);
      setOk(res?.message ?? "Inmueble creado.");

      // Limpieza suave (conservamos agente/cliente/tipo)
      setItems([]);
      setForm((s) => ({
        ...s,
        titulo: "",
        descripcion: "",
        direccion: "",
        zona: "",
        superficie: "0",
        dormitorios: "0",
        banos: "0",
        precio: "0",
      }));
    } catch (e2) {
      const apiMsg = e2?.response?.data?.message;
      const apiFieldErrors = e2?.response?.data?.values;
      setErr(apiMsg ?? e2?.message ?? "Error al crear inmueble");
      if (apiFieldErrors && typeof apiFieldErrors === "object") setFieldErrors(apiFieldErrors);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Crear inmueble</h1>
      </div>

      {err && <div className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-800">{err}</div>}
      {fieldErrors && Object.keys(fieldErrors).length > 0 && (
        <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-sm">
          <ul className="list-disc ml-5">
            {Object.entries(fieldErrors).map(([k, v]) => (
              <li key={k}>
                <b>{k}:</b> {String(v)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {ok && <div className="p-3 rounded-xl border border-green-300 bg-green-50 text-green-800">{ok}</div>}

      <form onSubmit={submit} className="space-y-6">
        {/* Card datos básicos */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Datos del inmueble</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agente: solo si admin */}
            {isAdmin && (
              <label className="flex flex-col">
                <span className="text-sm font-medium">
                  Agente <span className="text-red-500">*</span>
                </span>
                <select
                  name="agente"
                  value={form.agente}
                  onChange={onChange}
                  className={`border p-2 rounded-lg ${
                    fieldErrors?.agente ? "border-red-400" : ""
                  }`}
                >
                  <option value="">— Selecciona agente —</option>
                  {agentes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                {fieldErrors?.agente && (
                  <span className="text-xs text-red-600 mt-1">{fieldErrors.agente}</span>
                )}
              </label>
            )}

            {/* Cliente: opcional */}
            <label className="flex flex-col">
              <span className="text-sm font-medium">Cliente (opcional)</span>
              <select
                name="cliente"
                value={form.cliente}
                onChange={onChange}
                className="border p-2 rounded-lg"
              >
                <option value="">— Sin cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">
                Tipo de inmueble <span className="text-red-500">*</span>
              </span>
              <select
                name="tipo_inmueble_id"
                value={form.tipo_inmueble_id}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.tipo_inmueble_id ? "border-red-400" : ""
                }`}
              >
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              {fieldErrors?.tipo_inmueble_id && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.tipo_inmueble_id}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">
                Precio <span className="text-red-500">*</span>
              </span>
              <input
                name="precio"
                value={form.precio}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.precio ? "border-red-400" : ""
                }`}
                type="number"
                step="0.01"
                inputMode="decimal"
                onWheel={(e) => e.currentTarget.blur()}
              />
              {fieldErrors?.precio && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.precio}</span>
              )}
            </label>

            <label className="flex flex-col md:col-span-2">
              <span className="text-sm font-medium">
                Título <span className="text-red-500">*</span>
              </span>
              <input
                name="titulo"
                value={form.titulo}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.titulo ? "border-red-400" : ""
                }`}
                placeholder="Ej. Departamento moderno en el centro"
              />
              {fieldErrors?.titulo && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.titulo}</span>
              )}
            </label>

            <label className="flex flex-col md:col-span-2">
              <span className="text-sm font-medium">
                Descripción <span className="text-red-500">*</span>
              </span>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.descripcion ? "border-red-400" : ""
                }`}
                rows={4}
              />
              {fieldErrors?.descripcion && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.descripcion}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">
                Dirección <span className="text-red-500">*</span>
              </span>
              <input
                name="direccion"
                value={form.direccion}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.direccion ? "border-red-400" : ""
                }`}
              />
              {fieldErrors?.direccion && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.direccion}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">
                Ciudad <span className="text-red-500">*</span>
              </span>
              <input
                name="ciudad"
                value={form.ciudad}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.ciudad ? "border-red-400" : ""
                }`}
              />
              {fieldErrors?.ciudad && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.ciudad}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Zona</span>
              <input name="zona" value={form.zona} onChange={onChange} className="border p-2 rounded-lg" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Superficie (m²)</span>
              <input
                name="superficie"
                value={form.superficie}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.superficie ? "border-red-400" : ""
                }`}
                type="number"
                step="0.01"
                inputMode="decimal"
                onWheel={stopWheel}
              />
              {fieldErrors?.superficie && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.superficie}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Dormitorios</span>
              <input
                name="dormitorios"
                value={form.dormitorios}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.dormitorios ? "border-red-400" : ""
                }`}
                type="number"
                inputMode="numeric"
                onWheel={stopWheel}
              />
              {fieldErrors?.dormitorios && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.dormitorios}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Baños</span>
              <input
                name="banos"
                value={form.banos}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.banos ? "border-red-400" : ""
                }`}
                type="number"
                inputMode="numeric"
                onWheel={stopWheel}
              />
              {fieldErrors?.banos && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.banos}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Tipo de operación</span>
              <select
                name="tipo_operacion"
                value={form.tipo_operacion}
                onChange={onChange}
                className="border p-2 rounded-lg"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="anticretico">Anticrético</option>
              </select>
            </label>

            {/* Lat/Lng + MapPicker */}
            <label className="flex flex-col">
              <span className="text-sm font-medium">Latitud</span>
              <input
                name="latitud"
                value={form.latitud}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.latitud ? "border-red-400" : ""
                }`}
                type="number"
                step="0.000001"
                inputMode="decimal"
                onWheel={stopWheel}
              />
              {fieldErrors?.latitud && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.latitud}</span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Longitud</span>
              <input
                name="longitud"
                value={form.longitud}
                onChange={onChange}
                className={`border p-2 rounded-lg ${
                  fieldErrors?.longitud ? "border-red-400" : ""
                }`}
                type="number"
                step="0.000001"
                inputMode="decimal"
                onWheel={stopWheel}
              />
              {fieldErrors?.longitud && (
                <span className="text-xs text-red-600 mt-1">{fieldErrors.longitud}</span>
              )}
            </label>

            <div className="md:col-span-2">
              <MapPicker
                value={{
                  lat: parseFloat(form.latitud || "-17.7833"),
                  lng: parseFloat(form.longitud || "-63.1821"),
                }}
                onChange={({ lat, lng }) =>
                  setForm((s) => ({
                    ...s,
                    latitud: String(lat),
                    longitud: String(lng),
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Card fotos */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Fotos (opcional)</h2>

          {/* Botón estilizado */}
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg cursor-pointer hover:bg-sky-700 transition">
            📤 Subir fotos
            <input type="file" accept="image/*" multiple onChange={onPickFiles} className="hidden" />
          </label>

          {items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {items.map((it, i) => (
                <div key={i} className="border rounded-xl p-2 shadow-sm">
                  <img
                    src={it.previewUrl}
                    alt={it.name}
                    className="w-full h-28 object-cover rounded-lg"
                    onError={(e) =>
                      (e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+preview")
                    }
                  />
                  <div className="text-xs mt-1 truncate">{it.name}</div>
                  <div className="h-2 bg-gray-200 rounded mt-1 overflow-hidden">
                    <div
                      className={`h-2 ${
                        it.status === "error" ? "bg-red-500" : "bg-stone-900"
                      }`}
                      style={{
                        width: `${it.progress || (it.status === "ok" ? 100 : 0)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span
                      className={
                        it.status === "ok"
                          ? "text-green-700"
                          : it.status === "error"
                          ? "text-red-700"
                          : "text-gray-600"
                      }
                    >
                      {it.status === "subiendo" ? "Subiendo…" : it.status === "ok" ? "OK" : "Error"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFoto(i)}
                      className="text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Formato: JPG/PNG/WebP. Máx. recomendado: 5MB.</p>
        </div>

        <div className="pt-2">
          <button
            disabled={disabledSubmit}
            className="px-5 py-2.5 bg-blue-400 text-white rounded-xl disabled:opacity-60 bg-blue-600"
            title={subiendo ? "Espera a que terminen de subir las fotos" : ""}
          >
            {saving ? "Guardando..." : subiendo ? "Subiendo fotos..." : "Crear inmueble"}
          </button>
        </div>
      </form>
    </div>
  );
}

