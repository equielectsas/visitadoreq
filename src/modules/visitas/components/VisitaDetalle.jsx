"use client";

import { useState } from "react";
import { completarVisita } from "@/modules/visitas/services/visitas.service";

export default function VisitaDetalle({ visita, refresh }) {

  const [gps, setGps] = useState(null);
  const [contacto, setContacto] = useState("");
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState("");

  const obtenerGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setError("No se pudo obtener GPS")
    );
  };

  const handleCompletar = async () => {
    try {
      await completarVisita(visita.id, {
        gps,
        contacto,
        foto,
      });

      refresh();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">

      <h3 className="font-semibold">{visita.empresa}</h3>

      <button
        onClick={obtenerGPS}
        className="bg-gray-200 px-3 py-2 rounded text-sm"
      >
        Obtener GPS
      </button>

      {gps && (
        <p className="text-xs text-green-600">
          GPS capturado
        </p>
      )}

      <input
        type="text"
        placeholder="Nombre del contacto"
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <input
        type="file"
        onChange={(e) => setFoto(e.target.files[0])}
      />

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      <button
        onClick={handleCompletar}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        Completar visita
      </button>

    </div>
  );
}