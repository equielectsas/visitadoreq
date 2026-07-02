"use client";

import { useCallback, useEffect, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

const COLUMNAS_ESPERADAS = [
  "_id",
  "cliente",
  "segmentoMercado",
  "actividadEconomica",
  "nombre",
  "apellido",
  "celular",
  "correo",
  "telEmpresa",
  "cargo",
  "nivelInfluencia",
  "dirección",
  "ciudad",
  "departamento",
];

export default function AutomatizacionPage() {
  const [archivo, setArchivo] = useState(null);
  const [reemplazar, setReemplazar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [estadoLoading, setEstadoLoading] = useState(true);
  const [estado, setEstado] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const cargarEstado = useCallback(async () => {
    setEstadoLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/contactos-migrados/estado", {
        headers: { Authorization: token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      setEstado(data);
    } catch (e) {
      setEstado(null);
      setError(e?.message || "No se pudo cargar el estado.");
    } finally {
      setEstadoLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEstado();
  }, [cargarEstado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResultado(null);

    if (!archivo) {
      setError("Selecciona un archivo Excel (.xls o .xlsx).");
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("archivo", archivo);
      fd.append("reemplazar", reemplazar ? "true" : "false");

      const res = await fetch("/api/contactos-migrados/importar", {
        method: "POST",
        headers: { Authorization: token },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);

      setResultado(data);
      setArchivo(null);
      await cargarEstado();
    } catch (err) {
      setError(err?.message || "No se pudo importar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutDashboard>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Automatización</h1>
          <p className="text-sm text-gray-500 mt-1">
            Importa contactos históricos desde Excel a la colección{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">contactosMigrados</code>.
            Los asesores los verán al diligenciar el detalle de visita, relacionados por nombre de empresa.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide">Estado actual</h2>
          {estadoLoading ? (
            <p className="text-sm text-gray-500">Cargando…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Contactos</p>
                <p className="text-2xl font-black text-[#1C355E]">{estado?.total ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Empresas</p>
                <p className="text-2xl font-black text-[#1C355E]">{estado?.empresas ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Última importación</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  {estado?.ultimaImportacion
                    ? new Date(estado.ultimaImportacion).toLocaleString("es-CO")
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide">Subir Excel de contactos</h2>

          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-xs text-gray-600 font-semibold mb-2">Columnas esperadas en la primera hoja:</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">{COLUMNAS_ESPERADAS.join(" · ")}</p>
            <p className="text-[10px] text-gray-400 mt-2">
              La relación con empresas se hace por <strong>cliente</strong> (sin importar mayúsculas/minúsculas ni tildes).
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Archivo Excel</span>
            <input
              type="file"
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#1C355E] file:text-white file:font-bold hover:file:bg-[#16294d]"
            />
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reemplazar}
              onChange={(e) => setReemplazar(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-600">
              <strong>Reemplazar todos los contactos migrados</strong> antes de importar.
              Si lo desmarcas, los nuevos registros se agregarán sin borrar los existentes.
            </span>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {resultado && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              Importación exitosa: <strong>{resultado.insertados}</strong> contactos guardados
              {resultado.filasLeidas != null ? ` (${resultado.filasValidas} filas válidas de ${resultado.filasLeidas} leídas).` : "."}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1C355E] text-white text-sm font-bold hover:bg-[#16294d] disabled:opacity-50"
          >
            {loading ? "Importando…" : "Importar contactos"}
          </button>
        </form>
      </div>
    </LayoutDashboard>
  );
}
