// src/components/PropertyCard.jsx
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square } from "lucide-react";

function fmtMoney(num, prefijo = "Bs ") {
  if (num === null || num === undefined) return prefijo + "0";
  const n = Number(num);
  if (Number.isNaN(n)) return prefijo + "0";
  return prefijo + n.toLocaleString();
}

/**
 * UI de tarjeta de propiedad (mismo estilo que Home).
 *
 * Props:
 * - image, title, location, price, beds, baths, area
 * - to (href del botón "Ver más")
 * - actionLabel, onAction, actionDisabled (botón principal opcional)
 */
export default function PropertyCard({
  image,
  title,
  location,
  price,
  beds,
  baths,
  area,
  to = "#",
  actionLabel,
  onAction,
  actionDisabled = false,
}) {
  const img = image || "/placeholder.svg";

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
        </div>

        <div className="mb-4 flex items-center gap-1 text-sm text-stone-600">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>

        <div className="mb-4 flex items-center gap-4 text-sm text-stone-600">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{beds ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{baths ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{area ? `${area} m²` : "—"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-2xl font-bold text-orange-600">{fmtMoney(price)}</span>

          <div className="flex gap-2">
            {onAction && actionLabel && (
              <button
                type="button"
                onClick={onAction}
                disabled={actionDisabled}
                className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors ${
                  actionDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLabel}
              </button>
            )}

            <Link
              to={to}
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 hover:text-stone-700"
              aria-label={`Ver más sobre ${title}`}
            >
              Ver más
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
