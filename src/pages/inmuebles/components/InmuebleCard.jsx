// src/pages/Inmuebles/components/InmuebleCard.jsx
import BadgeEstadoAnuncio from "../../../components/BadgeEstadoAnuncio";

export default function InmuebleCard({
  data,
  showBadge = true,
  refreshKey = 0,
  onEstadoClick,               // abre panel lateral
  onPublicar,                  // publicar
  onOpenDetalle,               // 👈 navegar a detalle
  publishing = false,
  showPublishInCard = true,
}) {
  const fotos = Array.isArray(data?.fotos) ? data.fotos : [];
  const hero  = fotos.length ? fotos[0].url : null;

  const anuncioId  = data?.anuncio?.id || null;
  const estadoInm  = String(data?.estado || "").toLowerCase();
  const estadoAn   = String(data?.anuncio?.estado || "").toLowerCase();
  const publicadoActivo = !!data?.anuncio?.is_active && estadoAn === "disponible";

  const puedePublicar = showPublishInCard && estadoInm === "aprobado" && !publicadoActivo;

  const openDetalle = () => {
    if (typeof onOpenDetalle === "function") onOpenDetalle(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border relative">
      {/* Imagen clickable */}
      <div
        className="cursor-pointer"
        onClick={openDetalle}
        title="Ver detalle de la propiedad"
        role="button"
      >
        {hero ? (
          <img src={hero} alt={data?.titulo || "inmueble"} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-stone-200 grid place-items-center text-stone-500">
            Sin fotos
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 bg-stone-50">
        {/* Título + Badge a la derecha (título clickable) */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className="font-semibold text-xl text-stone-900 leading-tight truncate cursor-pointer hover:underline"
            onClick={openDetalle}
            title="Ver detalle de la propiedad"
            role="button"
          >
            {data?.titulo || "Sin título"}
          </h3>

          {showBadge && (
            <BadgeEstadoAnuncio
              key={`${anuncioId ?? "na"}-${refreshKey}`}
              anuncioId={anuncioId}
              refreshKey={refreshKey}
              className="shrink-0"
            />
          )}
        </div>

        {/* Dirección */}
        <p className="text-stone-600 mt-1 truncate">
          {data?.direccion || "—"}{data?.ciudad ? `, ${data.ciudad}` : ""}
        </p>

        {/* Precio */}
        <p className="mt-2 font-semibold text-blue-600">
          Precio: {Number(data?.precio || 0).toFixed(2)}
        </p>

        {/* Footer: Estado + Publicar */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => typeof onEstadoClick === "function" && onEstadoClick(data)}
            className="h-[38px] rounded-lg text-sm border border-stone-300 text-stone-800 hover:bg-stone-100"
            title="Ver/editar estado del anuncio"
          >
            Estado
          </button>

          {puedePublicar ? (
            <button
              type="button"
              onClick={() => typeof onPublicar === "function" && onPublicar(data)}
              disabled={publishing}
              className={`h-[38px] rounded-lg text-sm font-semibold ${
                publishing
                  ? "bg-neutral-800/10 text-neutral-700 cursor-not-allowed"
                  : "bg-black text-white hover:opacity-90"
              }`}
              title="Publicar este inmueble"
            >
              {publishing ? "Publicando..." : "Publicar"}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="h-[38px] rounded-lg text-sm bg-neutral-800/10 text-neutral-700 cursor-not-allowed"
              title="Solo para inmuebles aprobados no publicados"
            >
              Publicar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
