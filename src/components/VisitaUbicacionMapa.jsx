"use client";

/**
 * Mapa embebido sin Leaflet: evita "Map container is already initialized"
 * con React Strict Mode + modales. Misma idea que el iframe en DetallesVisitaModal.
 */
export default function VisitaUbicacionMapa({ lat, lng, title }) {
  const pad = 0.008;
  const west = lng - pad;
  const south = lat - pad;
  const east = lng + pad;
  const north = lat + pad;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${west},${south},${east},${north}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="h-[220px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
      <iframe
        title={title ? `Ubicación: ${title}` : "Ubicación de la visita"}
        src={src}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p className="sr-only">
        Mapa OpenStreetMap. Coordenadas aproximadas {lat.toFixed(5)}, {lng.toFixed(5)}.
      </p>
    </div>
  );
}
