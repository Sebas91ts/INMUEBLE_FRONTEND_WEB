import { useEffect, useMemo, useState } from "react";
import { listarTiposInmueble, crearInmueble } from "../../api/inmueble/index";
import { uploadImageToCloudinary } from "../../api/uploader";

export default function CreateInmueble() {
  // guardo TODO como string para que sea editable sin saltos;
  // parseo a número en el submit.
  const [form, setForm] = useState({
    cliente: "2",
    tipo_inmueble_id: "1",
    titulo: "",
    descripcion: "",
    direccion: "",
    ciudad: "La Paz",
    zona: "",
    superficie: "0",
    dormitorios: "0",
    banos: "0",           // << usa banos en front; el submit lo mapeará a "baños" si tu backend lo espera así
    precio: "0",
    tipo_operacion: "venta",
    latitud: "-16.5",
    longitud: "-68.15",
  });

  const [tipos, setTipos] = useState([]);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);
  const [saving, setSaving] = useState(false);

  // fotos
  const [items, setItems] = useState([]); // [{ name, previewUrl, status: 'subiendo'|'ok'|'error', progress, urlFinal }]
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    listarTiposInmueble().then(setTipos).catch(e => setErr(e?.message ?? "No se pudo cargar tipos"));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onPickFiles = async (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    // Previews inmediatas
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
    // Sube cada archivo
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
        } catch (err) {
          setItems((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], status: "error" };
            return copy;
          });
        }
      })
    );
    setSubiendo(false);

    // limpia el input file para poder volver a elegir las mismas imágenes si quieres
    e.target.value = "";
  };

  const removeFoto = (i) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const fotosUrls = useMemo(
    () => items.filter((x) => x.status === "ok" && x.urlFinal).map((x) => x.urlFinal),
    [items]
  );

  const disabledSubmit = saving || subiendo || fotosUrls.length === 0;

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    // validaciones mínimas
    if (!form.titulo.trim()) return setErr("El título es obligatorio.");
    if (fotosUrls.length === 0) return setErr("Debes subir al menos una foto.");
    setSaving(true);

    try {
      // parseo seguro (deja null si vacío)
      const toInt = (s) => (s === "" || s === null || s === undefined ? null : parseInt(s, 10));
      const toFloat = (s) => (s === "" || s === null || s === undefined ? null : parseFloat(s));

      const payload = {
        cliente: toInt(form.cliente),
        tipo_inmueble_id: toInt(form.tipo_inmueble_id),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
        zona: form.zona.trim(),
        superficie: toFloat(form.superficie),
        dormitorios: toInt(form.dormitorios),
        // si tu backend espera "baños" con ñ:
        ["baños"]: toInt(form.banos),
        // si lo cambiaste a "banos", usa:
        // banos: toInt(form.banos),

        precio: toFloat(form.precio),
        tipo_operacion: form.tipo_operacion,
        latitud: toFloat(form.latitud),
        longitud: toFloat(form.longitud),
        fotos_urls: fotosUrls,
      };

      const res = await crearInmueble(payload);
      setOk(res?.message ?? "Inmueble creado");
      // opcional: reset del formulario
      // setForm((s) => ({ ...s, titulo: "", descripcion: "", direccion: "", zona: "" }));
      // setItems([]);
    } catch (e2) {
      setErr(e2?.response?.data?.message ?? e2?.message ?? "Error al crear inmueble");
    } finally {
      setSaving(false);
    }
  };

  // util: evitar que el scroll del mouse cambie los number
  const stopWheel = (e) => e.currentTarget.blur();

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-5">
      <h1 className="text-2xl font-bold">Crear inmueble</h1>

      {err && <div className="p-3 rounded border border-red-300 bg-red-100">{err}</div>}
      {ok && <div className="p-3 rounded border border-green-300 bg-green-100">{ok}</div>}

      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm">Cliente (ID)</span>
            <input
              name="cliente"
              value={form.cliente}
              onChange={onChange}
              className="border p-2 rounded"
              type="number"
              inputMode="numeric"
              onWheel={stopWheel}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Tipo de inmueble</span>
            <select
              name="tipo_inmueble_id"
              value={form.tipo_inmueble_id}
              onChange={onChange}
              className="border p-2 rounded"
            >
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Título</span>
            <input
              name="titulo"
              value={form.titulo}
              onChange={onChange}
              className="border p-2 rounded"
              placeholder="Ej. Departamento moderno en el centro"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Precio</span>
            <input
              name="precio"
              value={form.precio}
              onChange={onChange}
              className="border p-2 rounded"
              type="number"
              step="0.01"
              inputMode="decimal"
              onWheel={stopWheel}
            />
          </label>

          <label className="flex flex-col md:col-span-2">
            <span className="text-sm">Descripción</span>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={onChange}
              className="border p-2 rounded"
              rows={4}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Dirección</span>
            <input name="direccion" value={form.direccion} onChange={onChange} className="border p-2 rounded" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Ciudad</span>
            <input name="ciudad" value={form.ciudad} onChange={onChange} className="border p-2 rounded" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Zona</span>
            <input name="zona" value={form.zona} onChange={onChange} className="border p-2 rounded" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Superficie (m²)</span>
            <input
              name="superficie"
              value={form.superficie}
              onChange={onChange}
              className="border p-2 rounded"
              type="number"
              step="0.01"
              inputMode="decimal"
              onWheel={stopWheel}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Dormitorios</span>
            <input
              name="dormitorios"
              value={form.dormitorios}
              onChange={onChange}
              className="border p-2 rounded"
              type="number"
              inputMode="numeric"
              onWheel={stopWheel}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Baños</span>
            <input
              name="banos"
              value={form.banos}
              onChange={onChange}
              className="border p-2 rounded"
              type="number"
              inputMode="numeric"
              onWheel={stopWheel}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Tipo de operación</span>
            <select
              name="tipo_operacion"
              value={form.tipo_operacion}
              onChange={onChange}
              className="border p-2 rounded"
            >
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="anticretico">Anticrético</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Latitud</span>
            <input
              name="latitud"
              value={form.latitud}
              onChange={onChange}
              className="border p-2 rounded"
              type="number"
              step="0.000001"
              inputMode="decimal"
              onWheel={stopWheel}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Longitud</span>
            <input
              name="longitud"
              value={form.longitud}
              onChange={onChange}
              className="border p-2 rounded"
              type="number"
              step="0.000001"
              inputMode="decimal"
              onWheel={stopWheel}
            />
          </label>
        </div>

        {/* Subida de fotos (solo archivo) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fotos del inmueble</label>
          <input type="file" accept="image/*" multiple onChange={onPickFiles} />

          {items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {items.map((it, i) => (
                <div key={i} className="border rounded p-2">
                  <img
                    src={it.previewUrl}
                    alt={it.name}
                    className="w-full h-28 object-cover rounded"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+preview")}
                  />
                  <div className="text-xs mt-1 truncate">{it.name}</div>
                  <div className="h-2 bg-gray-200 rounded mt-1 overflow-hidden">
                    <div
                      className={`h-2 ${it.status === "error" ? "bg-red-500" : "bg-blue-600"}`}
                      style={{ width: `${it.progress || (it.status === "ok" ? 100 : 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className={it.status === "ok" ? "text-green-700" : it.status === "error" ? "text-red-700" : "text-gray-600"}>
                      {it.status === "subiendo" ? "Subiendo…" : it.status === "ok" ? "OK" : "Error"}
                    </span>
                    <button type="button" onClick={() => removeFoto(i)} className="text-red-600">
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">Formato: JPG/PNG/WebP. Tamaño máx. recomendado: 5MB.</p>
        </div>

        <button
          disabled={disabledSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          title={subiendo ? "Espera a que terminen de subir las fotos" : fotosUrls.length === 0 ? "Sube al menos una foto" : ""}
        >
          {saving ? "Guardando..." : subiendo ? "Subiendo fotos..." : "Crear inmueble"}
        </button>
      </form>
    </div>
  );
}
