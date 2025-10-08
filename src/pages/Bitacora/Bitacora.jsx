import { useState } from "react";
import { leerBitacora } from "../../api/usuarios/usuarios";

export default function BitacoraDashboard() {
  const [llave, setLlave] = useState("");
  const [registros, setRegistros] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha: "",
    idUsuario: "",
    nombreUsuario: "",
    grupoUsuario: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

 const obtenerBitacora = async () => {
  try {
    const res = await leerBitacora(llave);
    if (res.data.status === 1) {
      const parsed = res.data.values.map((r) => {
        const fechaMatch = r.match(/^\[(.*?)\]/);
        const idMatch = r.match(/Usuario ID: (\d+)/);
        const nombreMatch = r.match(/Nombre de Usuario: (\w+)/);
        const grupoMatch = r.match(/Grupo del usuario: (\w+)/);
        const ipMatch = r.match(/IP: ([\d.]+)/);
        const accionMatch = r.match(/Acción:\s*(.*)/);

        return {
          fecha: fechaMatch ? fechaMatch[1] : "",
          idUsuario: idMatch ? idMatch[1] : "",
          nombreUsuario: nombreMatch ? nombreMatch[1] : "",
          grupoUsuario: grupoMatch ? grupoMatch[1] : "",
          ip: ipMatch ? ipMatch[1] : "",
          accion: accionMatch ? accionMatch[1].trim() : "-"
        };
      });

      setRegistros(parsed);
      setErrorMsg(""); // limpiar error si todo va bien
    } else {
      setErrorMsg(res.data.message);
    }
  } catch (error) {
    console.error(error);
    setErrorMsg("Error al obtener la bitácora");
  }
};


  const registrosFiltrados = registros.filter((r) => {
    return (
      (!filtros.fecha || r.fecha.includes(filtros.fecha)) &&
      (!filtros.idUsuario || r.idUsuario.includes(filtros.idUsuario)) &&
      (!filtros.nombreUsuario || r.nombreUsuario.toLowerCase().includes(filtros.nombreUsuario.toLowerCase())) &&
      (!filtros.grupoUsuario || r.grupoUsuario.toLowerCase().includes(filtros.grupoUsuario.toLowerCase()))
    );
  });

  return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Bitácora</h1>
          {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {errorMsg}
          </div>
          )}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Llave del desarrollador"
          value={llave}
          onChange={(e) => setLlave(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={obtenerBitacora}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Cargar
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Filtrar por fecha"
          value={filtros.fecha}
          onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filtrar por ID"
          value={filtros.idUsuario}
          onChange={(e) => setFiltros({ ...filtros, idUsuario: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filtrar por nombre"
          value={filtros.nombreUsuario}
          onChange={(e) => setFiltros({ ...filtros, nombreUsuario: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filtrar por grupo"
          value={filtros.grupoUsuario}
          onChange={(e) => setFiltros({ ...filtros, grupoUsuario: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      <div className="overflow-auto max-h-[500px]">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Fecha</th>
              <th className="border px-2 py-1">ID Usuario</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Grupo</th>
              <th className="border px-2 py-1">IP</th>
              <th className="border px-2 py-1">Acción</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r, i) => (
              <tr key={i} className="hover:bg-gray-100">
                <td className="border px-2 py-1">{r.fecha}</td>
                <td className="border px-2 py-1">{r.idUsuario}</td>
                <td className="border px-2 py-1">{r.nombreUsuario}</td>
                <td className="border px-2 py-1">{r.grupoUsuario}</td>
                <td className="border px-2 py-1">{r.ip}</td>
                <td className="border px-2 py-1">{r.accion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
