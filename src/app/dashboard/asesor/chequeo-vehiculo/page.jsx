"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import LayoutDashboard from "@/components/LayoutDashboard";
import {
  colombiaDateYmd,
  markChequeoEnviado,
  getAuthTokenFromStorage,
  isChequeoEnviadoHoyParaTipo,
  transporteChequeoFromTipoForm,
  fetchChequeoEstadoHoyDesdeApi,
  normalizeCompletadosChequeoPlataforma,
  replaceChequeoCompletadosHoyDesdePlataforma,
  fechaIsoReferenciaChequeoBogota,
  limpiarSesionChequeoObsoleta,
} from "@/utils/chequeoVehiculoStorage";
import {
  CARRO_SECCIONES,
  MOTO_SECCIONES,
  OPCIONES_SI_NO,
  OPCIONES_C_R_D,
  OPCIONES_C_D,
} from "@/utils/chequeoVehiculoFields";

function emptyCheckMap(keys) {
  return keys.reduce((acc, { key }) => {
    acc[key] = "";
    return acc;
  }, {});
}

function fieldCompleteClass(filled) {
  return filled
    ? "border-emerald-400/90 bg-emerald-50/60 text-gray-900 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
    : "border-gray-200 bg-white text-gray-800";
}

export default function ChequeoVehiculoPage() {
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(null); // 'carro' | 'moto' | 'publico'
  const [cedulaFisica, setCedulaFisica] = useState("");
  const [placa, setPlaca] = useState("");
  const [kilometraje, setKilometraje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [checks, setChecks] = useState({});
  const [todoOk, setTodoOk] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  /** Lo que consta hoy en la plataforma (BD vía API), no solo el navegador. */
  const [servidorEstado, setServidorEstado] = useState({ loading: true, error: null, completados: {} });

  const envioEnCursoRef = useRef(false);

  const secciones = useMemo(() => {
    if (tipo === "carro" || tipo === "publico") return CARRO_SECCIONES;
    if (tipo === "moto") return MOTO_SECCIONES;
    return [];
  }, [tipo]);

  const flatKeys = useMemo(() => {
    const ks = [];
    for (const sec of secciones) {
      for (const it of sec.items) ks.push(it);
    }
    return ks;
  }, [secciones]);

  const cargarEstadoPlataforma = useCallback(async () => {
    if (!user?.cedula) return;
    limpiarSesionChequeoObsoleta(user);
    const token = getAuthTokenFromStorage();
    setServidorEstado((s) => ({ ...s, loading: true, error: null }));
    const r = await fetchChequeoEstadoHoyDesdeApi({ token, cedula: user.cedula });
    if (r.ok) {
      const apiNorm = normalizeCompletadosChequeoPlataforma(r.completados);
      replaceChequeoCompletadosHoyDesdePlataforma(user, apiNorm);
      const display = normalizeCompletadosChequeoPlataforma(r.completados);
      setServidorEstado({ loading: false, error: null, completados: display });
    } else {
      setServidorEstado({
        loading: false,
        error: r.error || "Sin respuesta",
        completados: r.completados || {},
      });
    }
  }, [user]);

  const refrescarEstadoTrasEnvio = useCallback(async () => {
    if (!user?.cedula) return;
    const token = getAuthTokenFromStorage();
    for (let i = 0; i < 4; i++) {
      if (i) await new Promise((res) => setTimeout(res, 450 * i));
      const r = await fetchChequeoEstadoHoyDesdeApi({ token, cedula: user.cedula });
      if (!r.ok) continue;
      const apiNorm = normalizeCompletadosChequeoPlataforma(r.completados);
      replaceChequeoCompletadosHoyDesdePlataforma(user, apiNorm);
      const display = normalizeCompletadosChequeoPlataforma(r.completados);
      setServidorEstado({
        loading: false,
        error: null,
        completados: display,
      });
    }
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user) return;
    cargarEstadoPlataforma();
  }, [user, cargarEstadoPlataforma]);

  useEffect(() => {
    if (!tipo) {
      setChecks({});
      return;
    }
    setChecks(emptyCheckMap(flatKeys));
    setTodoOk(false);
    setCedulaFisica("");
    setPlaca("");
    setKilometraje("");
    setObservaciones("");
  }, [tipo]);

  const hoy = colombiaDateYmd();
  /** Chips: solo lo que devuelve la plataforma (reportes = BD expuesta por EQ). */
  const cVista = servidorEstado.completados || normalizeCompletadosChequeoPlataforma({});
  const puedeMostrarChips = !servidorEstado.error;
  const carroListo = puedeMostrarChips && Boolean(cVista.Carro);
  const motoListo = puedeMostrarChips && Boolean(cVista.Motocicleta);
  const publicoListo = puedeMostrarChips && Boolean(cVista["Transporte Público"]);
  const transporteSeleccionado = transporteChequeoFromTipoForm(tipo);
  const yaEnviadoEsteTipoHoy = Boolean(
    transporteSeleccionado && puedeMostrarChips && Boolean(cVista[transporteSeleccionado])
  );

  const setCheck = (key, v) => setChecks((c) => ({ ...c, [key]: v }));

  const validar = () => {
    // documentos
    if (!cedulaFisica.trim()) return "Cédula de ciudadanía (Si/No) es obligatoria.";
    if (!placa.trim()) return "Placa obligatoria.";
    const km = Number(String(kilometraje).replace(",", "."));
    if (!Number.isFinite(km) || km < 0) return "Kilometraje inválido.";
    for (const it of flatKeys) {
      const key = it.key;
      if (!checks[key]?.trim()) return `Completa: ${it.label}`;
    }
    return "";
  };

  const toggleTodoOk = () => {
    setTodoOk((prev) => {
      const next = !prev;
      if (next) {
        // Activar: documentos en "Si" y el resto en "Conforme"
        setChecks((p) => {
          const n = { ...p };
          for (const sec of secciones) {
            if (sec.kind === "si-no") {
              for (const it of sec.items) n[it.key] = "Si";
              continue;
            }
            for (const it of sec.items) n[it.key] = "Conforme";
          }
          return n;
        });
        setCedulaFisica("Si");
      } else {
        // Desactivar: limpiar todo lo seleccionado
        setChecks(emptyCheckMap(flatKeys));
        setCedulaFisica("");
        setPlaca("");
        setKilometraje("");
        setObservaciones("");
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!tipo) return;
    if (envioEnCursoRef.current) return;
    envioEnCursoRef.current = true;
    setSending(true);
    try {
      const token = getAuthTokenFromStorage();
      if (!token) {
        setError("No hay sesión. Vuelve a iniciar sesión.");
        return;
      }
      const snap = await fetchChequeoEstadoHoyDesdeApi({ token, cedula: user.cedula });
      if (!snap.ok) {
        setError(
          snap.error ||
            "No se pudo consultar la plataforma para saber si ya enviaste el chequeo hoy. Reintenta en unos segundos."
        );
        return;
      }
      const apiNorm = normalizeCompletadosChequeoPlataforma(snap.completados);
      replaceChequeoCompletadosHoyDesdePlataforma(user, apiNorm);
      const bloqueo = normalizeCompletadosChequeoPlataforma(snap.completados);
      setServidorEstado({ loading: false, error: null, completados: bloqueo });
      if (isChequeoEnviadoHoyParaTipo(tipo, bloqueo)) {
        setError(
          "Ya consta el chequeo de este tipo para hoy en la plataforma. Solo podrás volver a enviarlo cuando sea un nuevo día en Colombia."
        );
        return;
      }
      const msg = validar();
      if (msg) {
        setError(msg);
        return;
      }
      const tokenTrim = String(token || "").trim();
      const bearer = tokenTrim.toLowerCase().startsWith("bearer ") ? tokenTrim : `Bearer ${tokenTrim}`;
      const cedulaNum = Number(String(user?.cedula).replace(/\D/g, ""));
      if (!cedulaNum || cedulaNum < 10000) {
        setError("Tu cédula no cumple el formato requerido por el servidor (número ≥ 10000).");
        return;
      }

      const path =
        tipo === "moto"
          ? "/chequeoVehiculos/chequeoMoto"
          : tipo === "publico"
            ? "/chequeoVehiculos/chequeoTransportePublico"
            : "/chequeoVehiculos/chequeoCarro";
      const url = `/chequeo-proxy${path}`;

      const km = Number(String(kilometraje).replace(",", "."));

      const body = {
        fecha: fechaIsoReferenciaChequeoBogota(),
        nombre: user.nombre || "",
        rol: user.rol || "comercial",
        cedula: cedulaNum,
        placa: placa.trim().toUpperCase(),
        kilometraje: km,
        observaciones: observaciones.trim() || "",
        ...checks,
        cedulaFisica: checks.cedulaFisica?.trim() || cedulaFisica.trim(),
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokenTrim,
          "X-Access-Token": tokenTrim,
          "X-Authorization": bearer,
        },
        body: JSON.stringify(body),
      });
      const rawText = await res.text().catch(() => "");
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        if (res.status === 409) {
          setError(
            data?.message ||
              "Ya consta un chequeo de este tipo para hoy (misma cédula). Si lo enviaste desde otro aplicativo, no puedes duplicarlo."
          );
          await cargarEstadoPlataforma();
          return;
        }
        const boomMsg =
          data?.output?.payload?.message ||
          (Array.isArray(data?.errors) && data.errors.map((e) => e.message).filter(Boolean).join("; "));
        throw new Error(
          boomMsg || data.message || data.msg || (rawText && String(rawText).slice(0, 300)) || `Error ${res.status}`
        );
      }
      const tipoTransporte =
        tipo === "moto" ? "Motocicleta" : tipo === "publico" ? "Transporte Público" : "Carro";
      markChequeoEnviado(user, tipoTransporte);
      setServidorEstado((prev) => ({
        loading: false,
        error: null,
        completados: {
          ...normalizeCompletadosChequeoPlataforma(prev.completados),
          [tipoTransporte]: true,
        },
      }));
      await refrescarEstadoTrasEnvio();
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      const msg = err?.message || "";
      if (
        msg === "Failed to fetch" ||
        /networkerror|load failed|fetch/i.test(msg) ||
        err?.name === "TypeError"
      ) {
        setError(
          "No se pudo conectar con el servidor de chequeo. Comprueba CHEQUEO_API_REWRITE_TARGET en Vercel y que el API de plataforma esté en línea."
        );
      } else {
        setError(msg || "No se pudo enviar el formulario.");
      }
    } finally {
      setSending(false);
      envioEnCursoRef.current = false;
    }
  };

  if (!user) {
    return (
      <LayoutDashboard>
        <p className="text-gray-500">Cargando…</p>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Seguridad vial</p>
          <h1 className="text-2xl font-black text-gray-800 mt-0.5">Chequeo vehículo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Obligatorio <strong>una vez al día</strong> por tipo de transporte (Carro, Motocicleta o Transporte público) si vas a{" "}
            <strong>cerrar visitas</strong> con ese medio. El estado sale solo de la plataforma (mismos reportes que la BD); al cambiar de día en Colombia podrás volver a enviar.{" "}
            <Link href="/dashboard/asesor" className="text-[#1C355E] font-semibold underline">
              Volver a visitas
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Estado hoy ({hoy})
            {servidorEstado.loading ? (
              <span className="ml-2 font-normal text-gray-400 normal-case">· Consultando la plataforma…</span>
            ) : null}
          </p>
          {servidorEstado.error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              <span className="font-semibold">No se pudo leer el estado en la plataforma:</span> {servidorEstado.error}{" "}
              <button
                type="button"
                onClick={() => cargarEstadoPlataforma()}
                className="font-bold text-[#1C355E] underline ml-1"
              >
                Reintentar
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                carroListo ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
              }`}
            >
              Carro: {carroListo ? "Enviado ✓" : "Pendiente"}
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                motoListo ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
              }`}
            >
              Motocicleta: {motoListo ? "Enviado ✓" : "Pendiente"}
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                publicoListo ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
              }`}
            >
              Transporte público: {publicoListo ? "Enviado ✓" : "Pendiente"}
            </span>
          </div>
        </div>

        {!tipo && (
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              type="button"
              disabled={carroListo}
              onClick={() => {
                if (carroListo) return;
                setTipo("carro");
              }}
              className={`rounded-2xl border-2 p-8 text-left transition-all ${
                carroListo
                  ? "border-emerald-200 bg-emerald-50/80 cursor-not-allowed opacity-90"
                  : "border-gray-200 hover:border-[#1C355E] hover:bg-[#1C355E]/5"
              }`}
            >
              <p className="text-4xl mb-2">🚗</p>
              <p className="font-black text-[#1C355E]">Chequeo carro</p>
              {carroListo ? (
                <p className="text-xs font-bold text-emerald-700 mt-2">Enviado hoy — no puedes repetir hasta mañana</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Formulario completo según plataforma</p>
              )}
            </button>
            <button
              type="button"
              disabled={motoListo}
              onClick={() => {
                if (motoListo) return;
                setTipo("moto");
              }}
              className={`rounded-2xl border-2 p-8 text-left transition-all ${
                motoListo
                  ? "border-emerald-200 bg-emerald-50/80 cursor-not-allowed opacity-90"
                  : "border-gray-200 hover:border-[#1C355E] hover:bg-[#1C355E]/5"
              }`}
            >
              <p className="text-4xl mb-2">🏍️</p>
              <p className="font-black text-[#1C355E]">Chequeo moto</p>
              {motoListo ? (
                <p className="text-xs font-bold text-emerald-700 mt-2">Enviado hoy — no puedes repetir hasta mañana</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Formulario completo según plataforma</p>
              )}
            </button>
            <button
              type="button"
              disabled={publicoListo}
              onClick={() => {
                if (publicoListo) return;
                setTipo("publico");
              }}
              className={`rounded-2xl border-2 p-8 text-left transition-all ${
                publicoListo
                  ? "border-emerald-200 bg-emerald-50/80 cursor-not-allowed opacity-90"
                  : "border-gray-200 hover:border-[#1C355E] hover:bg-[#1C355E]/5"
              }`}
            >
              <p className="text-4xl mb-2">🚌</p>
              <p className="font-black text-[#1C355E]">Chequeo transporte público</p>
              {publicoListo ? (
                <p className="text-xs font-bold text-emerald-700 mt-2">Enviado hoy — no puedes repetir hasta mañana</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Se llena igual que carro (no pasa derecho)</p>
              )}
            </button>
          </div>
        )}

        {tipo && yaEnviadoEsteTipoHoy && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 shadow-sm space-y-4">
            <p className="text-sm font-bold text-emerald-900">
              Ya enviaste el chequeo de{" "}
              <strong>
                {tipo === "moto" ? "motocicleta" : tipo === "publico" ? "transporte público" : "carro"}
              </strong>{" "}
              hoy ({hoy}). Una sola vez al día por tipo.
            </p>
            <p className="text-xs text-emerald-800/90">
              Mañana (nuevo día en Colombia) podrás volver a enviarlo desde aquí.
            </p>
            <button
              type="button"
              onClick={() => {
                setTipo(null);
                setError("");
              }}
              className="text-sm font-bold text-[#1C355E] underline hover:no-underline"
            >
              Volver a elegir tipo
            </button>
          </div>
        )}

        {tipo && !yaEnviadoEsteTipoHoy && (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-gray-800">
                {tipo === "moto" ? "Lista de chequeo preoperacional para motos" : "Lista de chequeo preoperacional para carros"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setTipo(null);
                  setError("");
                }}
                className="text-sm font-semibold text-gray-500 hover:text-[#1C355E]"
              >
                Cambiar tipo
              </button>
            </div>

            <div
              className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border px-3 py-2 transition-colors ${
                todoOk
                  ? "border-emerald-300/80 bg-emerald-50/50"
                  : "border-gray-200/90 bg-gray-50/40"
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                    todoOk ? "bg-emerald-500 text-white" : "bg-white text-[#1C355E] shadow-sm ring-1 ring-gray-200"
                  }`}
                  aria-hidden
                >
                  {todoOk ? "✓" : "⚡"}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold text-gray-800">Relleno rápido</p>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Documentos en <span className="text-gray-700 font-medium">Sí</span>, ítems en{" "}
                    <span className="text-gray-700 font-medium">Conforme</span>. Pulsa de nuevo para vaciar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTodoOk}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  todoOk
                    ? "bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-50"
                    : "bg-[#1C355E] text-white hover:bg-[#16294d] shadow-sm"
                }`}
              >
                {todoOk ? "Deshacer" : "Todo conforme"}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Nombre</label>
                <div className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium text-gray-700">
                  {user.nombre}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Cédula</label>
                <div className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium text-gray-700">
                  {user.cedula}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Placa <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border text-sm uppercase transition-colors ${fieldCompleteClass(
                    Boolean(placa.trim())
                  )}`}
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Kilometraje <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={kilometraje}
                  onChange={(e) => setKilometraje(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border text-sm max-w-xs transition-colors ${fieldCompleteClass(
                    kilometraje !== "" && Number.isFinite(Number(String(kilometraje).replace(",", ".")))
                  )}`}
                />
              </div>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {secciones.map((sec) => {
                const opciones =
                  sec.kind === "si-no" ? OPCIONES_SI_NO :
                  sec.kind === "cd" ? OPCIONES_C_D :
                  OPCIONES_C_R_D;

                return (
                  <div key={sec.title} className="rounded-2xl border border-gray-100 p-4 bg-white">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs font-black text-gray-600 uppercase tracking-wide">{sec.title}</p>
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 gap-3">
                      {sec.items.map(({ key, label }) => {
                        const rawVal =
                          key === "cedulaFisica"
                            ? checks[key] || cedulaFisica || ""
                            : checks[key] || "";
                        const filled = Boolean(String(rawVal).trim());
                        return (
                        <div key={key} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">
                            {label} <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={rawVal}
                            onChange={(e) => {
                              setCheck(key, e.target.value);
                              if (key === "cedulaFisica") setCedulaFisica(e.target.value);
                              setTodoOk(false);
                            }}
                            className={`px-3 py-2 rounded-xl border text-sm transition-colors ${fieldCompleteClass(
                              filled
                            )}`}
                          >
                            <option value="">Seleccionar…</option>
                            {opciones.map((op) => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Observaciones</label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className={`px-4 py-2.5 rounded-xl border text-sm resize-none transition-colors ${fieldCompleteClass(
                  Boolean(observaciones.trim())
                )}`}
                placeholder="Opcional"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}
            {done && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-bold">
                ¡Enviado correctamente! Ya puedes cerrar visitas con este tipo de transporte hoy.
              </div>
            )}

            <button
              type="submit"
              disabled={sending || servidorEstado.loading || yaEnviadoEsteTipoHoy}
              className="w-full py-4 rounded-xl bg-[#1C355E] text-white font-bold text-sm hover:bg-[#16294d] disabled:opacity-50 touch-manipulation"
            >
              {sending ? "Enviando…" : servidorEstado.loading ? "Consultando plataforma…" : "Enviar chequeo al servidor"}
            </button>
          </form>
        )}
      </div>
    </LayoutDashboard>
  );
}
