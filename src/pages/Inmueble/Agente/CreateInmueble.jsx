import { useEffect, useMemo, useState } from "react";
import { listarTiposInmueble, crearInmueble } from "../../../api/inmueble";
import { uploadImageToCloudinary } from "../../../api/uploader";
import { getUsuarios } from "../../../api/usuarios/usuarios";

// 💡 Componente de alertas reutilizable
function AlertMessage({ type = "info", message }) {
  const styles = {
    success: "border-green-400 bg-green-100 text-green-800",
    error: "border-red-400 bg-red-100 text-red-800",
    warning: "border-amber-400 bg-amber-100 text-amber-800",
    info: "border-blue-400 bg-blue-100 text-blue-800",
  };
  return (
    <div className={`p-3 rounded border ${styles[type]} text-sm`}>
      {message}
    </div>
  );
}

export default function CreateInmuebleAgente() {
  const [form, setForm] = useState({
    cliente: "",
    tipo_inmueble_id: "",
    titulo: "",
    descripcion: "",
    direccion: "",
    ciudad: "La Paz",
    zona: "",
    superficie: "0",
    dormitorios: "0",
    banos: "0",
    precio: "0",
    tipo_operacion: "venta",
    latitud: "-16.5",
    longitud: "-68.15",
  });

  const [tipos, setTipos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [items, setItems] = useState([]);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState(null);

  // ==================================================
  // 🔹 Cargar tipos de inmueble y clientes
  // ==================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tiposRes = await listarTiposInmueble();
        const arrTipos =
          tiposRes?.data?.values?.tipo_inmueble ||
          tiposRes?.values?.tipo_inmueble ||
          tiposRes?.data ||
          tiposRes;
        setTipos(Array.isArray(arrTipos) ? arrTipos : []);

        const usersRes = await getUsuarios();
        const arrUsers =
          usersRes?.data?.values?.usuarios ||
          usersRes?.data?.values ||
          usersRes?.data ||
          usersRes;
        const onlyClients = (Array.isArray(arrUsers) ? arrUsers : []).filter((u) =>
          String(u.grupo_nombre || u.grupo?.nombre || "")
            .toLowerCase()
            .includes("client")
        );
        setClientes(onlyClients);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
        setErrMsg(
          "Error al cargar los datos. Verifica tus permisos o conexión."
        );
        setTipos([]);
        setClientes([]);
      }
    };
    fetchData();
  }, []);

  // ==================================================
  // 🔹 Manejo de formulario
  // ==================================================
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const stopWheel = (e) => e.currentTarget.blur();

  // ==================================================
  // 🔹 Manejo de imágenes
  // ==================================================
  const fotosUrls = useMemo(
    () => items.filter((x) => x.status === "ok" && x.urlFinal).map((x) => x.urlFinal),
    [items]
  );

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

  // ==================================================
  // 🔹 Enviar formulario
  // ==================================================
  const submit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setOkMsg("");
    setFieldErrors(null);

    if (!form.titulo.trim()) {
      setErrMsg("El título es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const toInt = (s) => (s ? parseInt(s, 10) : null);
      const toFloat = (s) => (s ? parseFloat(s) : null);

      const payload = {
        ...(form.cliente ? { cliente: toInt(form.cliente) } : {}),
        tipo_inmueble_id: toInt(form.tipo_inmueble_id),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
        zona: form.zona.trim(),
        superficie: toFloat(form.superficie),
        dormitorios: toInt(form.dormitorios),
        ["baños"]: toInt(form.banos),
        precio: toFloat(form.precio),
        tipo_operacion: form.tipo_operacion,
        latitud: toFloat(form.latitud),
        longitud: toFloat(form.longitud),
        ...(fotosUrls.length ? { fotos_urls: fotosUrls } : {}),
      };

      const res = await crearInmueble(payload);
      const msg =
        res?.message ||
        "INMUEBLE REGISTRADO CORRECTAMENTE ESPERANDO APROBACIÓN DEL ADMINISTRADOR.";
      setOkMsg(msg);
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
      console.error("❌ Error creando inmueble:", e2);

      const status = e2?.response?.status;
      const apiMsg = e2?.response?.data?.message;
      const apiFieldErrors = e2?.response?.data?.values;

      if (status === 401)
        setErrMsg("No estás autenticado. Inicia sesión nuevamente.");
      else if (status === 403)
        setErrMsg("No tienes permisos para registrar un inmueble.");
      else if (status === 400)
        setErrMsg(apiMsg || "Hay errores en el formulario.");
      else if (status >= 500)
        setErrMsg("Error del servidor. Intenta nuevamente más tarde.");
      else setErrMsg(apiMsg || e2.message || "Error desconocido.");

      if (apiFieldErrors && typeof apiFieldErrors === "object")
        setFieldErrors(apiFieldErrors);
    } finally {
      setSaving(false);
    }
  };

  const disabledSubmit = saving || subiendo;

  // ==================================================
  // 🔹 Render
  // ==================================================
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-5">
      <h1 className="text-2xl font-bold">Crear inmueble (Agente)</h1>

      {okMsg && <AlertMessage type="success" message={okMsg} />}
      {errMsg && <AlertMessage type="error" message={errMsg} />}

      {fieldErrors && (
        <div className="p-3 rounded border border-amber-300 bg-amber-50 text-sm">
          <strong>Revisa los siguientes campos:</strong>
          <ul className="list-disc pl-5 mt-1">
            {Object.entries(fieldErrors).map(([field, errors]) => (
              <li key={field}>
                <span className="font-medium capitalize">{field}:</span>{" "}
                {Array.isArray(errors) ? errors.join(", ") : String(errors)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cliente opcional */}
          <label className="flex flex-col">
            <span className="text-sm">Cliente (opcional)</span>
            <select
              name="cliente"
              value={form.cliente}
              onChange={onChange}
              className="border p-2 rounded"
            >
              <option value="">— Sin cliente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_completo || c.username || `Cliente #${c.id}`}
                </option>
              ))}
            </select>
          </label>

          {/* Tipo de inmueble */}
          <label className="flex flex-col">
            <span className="text-sm">Tipo de inmueble</span>
            <select
              name="tipo_inmueble_id"
              value={form.tipo_inmueble_id}
              onChange={onChange}
              className="border p-2 rounded"
            >
              <option value="">Seleccione un tipo</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* Precio */}
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

          {/* Título */}
          <label className="flex flex-col md:col-span-2">
            <span className="text-sm">Título</span>
            <input
              name="titulo"
              value={form.titulo}
              onChange={onChange}
              className="border p-2 rounded"
              placeholder="Ej. Departamento moderno en el centro"
            />
          </label>

          {/* Descripción */}
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
            <input
              name="direccion"
              value={form.direccion}
              onChange={onChange}
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Ciudad</span>
            <input
              name="ciudad"
              value={form.ciudad}
              onChange={onChange}
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm">Zona</span>
            <input
              name="zona"
              value={form.zona}
              onChange={onChange}
              className="border p-2 rounded"
            />
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

        {/* Fotos (opcional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Fotos del inmueble (opcional)
          </label>
          <input type="file" accept="image/*" multiple onChange={onPickFiles} />

          {items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {items.map((it, i) => (
                <div key={i} className="border rounded p-2">
                  <img
                    src={it.previewUrl}
                    alt={it.name}
                    className="w-full h-28 object-cover rounded"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://via.placeholder.com/300x200?text=No+preview")
                    }
                  />
                  <div className="text-xs mt-1 truncate">{it.name}</div>
                  <div className="h-2 bg-gray-200 rounded mt-1 overflow-hidden">
                    <div
                      className={`h-2 ${
                        it.status === "error" ? "bg-red-500" : "bg-blue-600"
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
                      {it.status === "subiendo"
                        ? "Subiendo…"
                        : it.status === "ok"
                        ? "OK"
                        : "Error"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFoto(i)}
                      className="text-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          disabled={disabledSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          title={subiendo ? "Espera a que terminen de subir las fotos" : ""}
        >
          {saving
            ? "Guardando..."
            : subiendo
            ? "Subiendo fotos..."
            : "Crear inmueble"}
        </button>
      </form>
    </div>
  );
}





