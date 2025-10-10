// src/pages/Inmuebles/components/InmuebleCard.jsx
export default function InmuebleCard({ data, onClick }) {
  const fotos = Array.isArray(data?.fotos) ? data.fotos : [];
  const hero = fotos.length ? fotos[0].url : null;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden border cursor-pointer"
      onClick={onClick}
    >
      {hero ? (
        <img
          src={hero}
          alt={data.titulo}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-stone-200 grid place-items-center text-stone-500">
          Sin fotos
        </div>
      )}
      <div className="p-5 bg-stone-50">
        <h3 className="font-semibold text-xl text-stone-900 leading-tight">
          {data.titulo}
        </h3>
        <p className="text-stone-600 mt-1">
          {data.direccion}
          {data?.ciudad ? `, ${data.ciudad}` : ""}
        </p>
        <p className="mt-2 font-semibold text-blue-600">
          Precio: {Number(data?.precio || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
