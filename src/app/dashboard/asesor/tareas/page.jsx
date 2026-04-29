"use client";
import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { supabase } from "@/lib/api/supabaseClient";
import LayoutDashboard from "@/components/LayoutDashboard";

const CHECKBOX_LABELS = {
  presentacionProductos: "Presentación de productos",
  demostracion: "Demostración del sistema",
  cotizacion: "Envío de cotización",
  seguimientoPago: "Seguimiento de pago",
  firmaContrato: "Firma de contrato",
};

export default function TareasPendientesAsesor() {
    const [session, setSession] = useState(null);

    useEffect(() => {
    const getSession = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
    };

    getSession();
    }, []);

  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [localChecks, setLocalChecks] = useState({});
  const [localNotas, setLocalNotas] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("todas");

  // ─── FETCH TAREAS REALES DEL ASESOR LOGUEADO ─────────────────────────────
  const fetchTareas = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visitas")
        .select(`
          id,
          empresa,
          nit,
          ciudad,
          telefono,
          contacto,
          fecha_visita,
          completada,
          checkboxes,
          notas
        `)
        .eq("asesor_id", session.user.id)
        .order("fecha_visita", { ascending: true });

      if (error) throw error;

      // Normalizar estructura para compatibilidad con el componente
      const normalized = (data || []).map((v) => ({
        id: v.id,
        empresa: v.empresa,
        nit: v.nit,
        ciudad: v.ciudad,
        telefono: v.telefono,
        contacto: v.contacto,
        fechaVisita: v.fecha_visita,
        completada: v.completada,
        checkboxes: v.checkboxes ?? {
          presentacionProductos: false,
          demostracion: false,
          cotizacion: false,
          seguimientoPago: false,
          firmaContrato: false,
        },
        notas: v.notas ?? "",
      }));

      setTareas(normalized);
    } catch (err) {
      console.error("Error cargando visitas:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    if (status === "authenticated") fetchTareas();
  }, [status, fetchTareas]);

  // ─── MARCAR ALERTA COMO VISTA ─────────────────────────────────────────────
  useEffect(() => {
    const marcarAlertaVista = async () => {
      if (!session?.user?.id) return;
      await supabase
        .from("asesores")
        .update({ alerta_pendiente: false })
        .eq("id", session.user.id);
    };
    if (status === "authenticated") marcarAlertaVista();
  }, [session?.user?.id, status, supabase]);

  // ─── FILTROS ──────────────────────────────────────────────────────────────
  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);
  const filtered =
    filter === "pendientes"
      ? pendientes
      : filter === "completadas"
      ? completadas
      : tareas;

  // ─── MODAL ────────────────────────────────────────────────────────────────
  const openModal = (tarea) => {
    setSelected(tarea);
    setLocalChecks({ ...tarea.checkboxes });
    setLocalNotas(tarea.notas ?? "");
    setHasChanges(false);
    setSaved(false);
  };

  const closeModal = () => {
    setSelected(null);
    setHasChanges(false);
    setSaved(false);
  };

  const handleCheck = (key) => {
    if (selected.completada) return;
    const updated = { ...localChecks, [key]: !localChecks[key] };
    setLocalChecks(updated);
    const changed =
      JSON.stringify(updated) !== JSON.stringify(selected.checkboxes) ||
      localNotas !== selected.notas;
    setHasChanges(changed);
  };

  const handleNotas = (val) => {
    setLocalNotas(val);
    const changed =
      JSON.stringify(localChecks) !== JSON.stringify(selected.checkboxes) ||
      val !== selected.notas;
    setHasChanges(changed);
  };

  // ─── GUARDAR EN SUPABASE ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const allDone = Object.values(localChecks).every(Boolean);
    const nuevaCompletada = allDone ? true : selected.completada;

    try {
      const { error } = await supabase
        .from("visitas")
        .update({
          checkboxes: localChecks,
          notas: localNotas,
          completada: nuevaCompletada,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selected.id);

      if (error) throw error;

      // Actualizar estado local
      setTareas((prev) =>
        prev.map((t) =>
          t.id === selected.id
            ? { ...t, checkboxes: localChecks, notas: localNotas, completada: nuevaCompletada }
            : t
        )
      );
      setSelected((prev) => ({
        ...prev,
        checkboxes: localChecks,
        notas: localNotas,
        completada: nuevaCompletada,
      }));
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error guardando visita:", err);
      alert("Error al guardar. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const checkedCount = (tarea) =>
    Object.values(tarea.checkboxes).filter(Boolean).length;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <LayoutDashboard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#aaa", fontFamily: "DM Sans, sans-serif" }}>
          Cargando visitas...
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        .tp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .tp-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.5rem; color: #111; }
        .tp-sub { font-size: 0.85rem; color: #888; margin-top: 2px; }
        .tp-filters { display: flex; gap: 8px; margin: 18px 0 14px; }
        .tp-filter-btn {
          padding: 6px 16px; border-radius: 20px; border: 1.5px solid #e5e7eb;
          font-size: 0.8rem; font-weight: 500; cursor: pointer; background: #fff;
          color: #555; transition: all 0.18s;
        }
        .tp-filter-btn.active { background: #111; color: #fff; border-color: #111; }
        .tp-filter-btn:hover:not(.active) { border-color: #111; color: #111; }
        .tp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .tp-stat { background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 14px 16px; }
        .tp-stat-label { font-size: 0.75rem; color: #999; margin-bottom: 4px; }
        .tp-stat-val { font-size: 1.4rem; font-weight: 600; color: #111; font-family: 'Syne', sans-serif; }
        .tp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .tp-card {
          background: #fff; border: 1.5px solid #f0f0f0; border-radius: 16px;
          padding: 18px 20px; cursor: pointer; transition: all 0.2s;
          position: relative; overflow: hidden;
        }
        .tp-card:hover { border-color: #d0d0d0; box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .tp-card.completada { background: #fafafa; cursor: default; }
        .tp-card.completada:hover { transform: none; box-shadow: none; }
        .tp-card-accent {
          position: absolute; top: 0; left: 0; width: 4px; height: 100%;
          background: #ef4444; border-radius: 16px 0 0 16px;
        }
        .tp-card-accent.done { background: #22c55e; }
        .tp-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .tp-empresa { font-weight: 600; font-size: 0.95rem; color: #111; line-height: 1.3; }
        .tp-nit { font-size: 0.75rem; color: #aaa; margin-top: 2px; font-family: monospace; }
        .tp-badge {
          font-size: 0.7rem; padding: 3px 10px; border-radius: 20px; font-weight: 600;
          white-space: nowrap;
        }
        .tp-badge.pending { background: #fef2f2; color: #ef4444; }
        .tp-badge.done { background: #f0fdf4; color: #22c55e; }
        .tp-info { display: flex; flex-direction: column; gap: 4px; margin: 10px 0; }
        .tp-info-row { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #666; }
        .tp-info-icon { font-size: 0.75rem; }
        .tp-progress-bar { height: 4px; background: #f3f4f6; border-radius: 4px; margin-top: 12px; }
        .tp-progress-fill { height: 100%; border-radius: 4px; background: #111; transition: width 0.4s; }
        .tp-progress-fill.done { background: #22c55e; }
        .tp-progress-label { font-size: 0.72rem; color: #aaa; margin-top: 5px; }
        /* MODAL */
        .tp-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(4px); padding: 20px;
        }
        .tp-modal {
          background: #fff; border-radius: 20px; width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.18);
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .tp-modal-header {
          padding: 22px 24px 16px; border-bottom: 1px solid #f0f0f0;
          display: flex; justify-content: space-between; align-items: flex-start;
        }
        .tp-modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; color: #111; }
        .tp-modal-nit { font-size: 0.78rem; color: #aaa; font-family: monospace; margin-top: 3px; }
        .tp-close-btn {
          width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #e5e7eb;
          background: #fff; cursor: pointer; display: flex; align-items: center;
          justify-content: center; font-size: 1rem; color: #555; flex-shrink: 0;
          transition: all 0.15s;
        }
        .tp-close-btn:hover { background: #f3f4f6; border-color: #ccc; }
        .tp-modal-body { padding: 20px 24px; }
        .tp-modal-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .tp-modal-info-item { background: #f9fafb; border-radius: 10px; padding: 10px 12px; }
        .tp-modal-info-label { font-size: 0.7rem; color: #aaa; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.05em; }
        .tp-modal-info-val { font-size: 0.88rem; color: #111; font-weight: 500; }
        .tp-section-title { font-size: 0.8rem; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
        .tp-check-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .tp-check-item {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          border-radius: 10px; border: 1.5px solid #f0f0f0; transition: all 0.15s;
          cursor: pointer;
        }
        .tp-check-item:hover:not(.disabled) { border-color: #d0d0d0; background: #fafafa; }
        .tp-check-item.disabled { cursor: default; opacity: 0.75; }
        .tp-check-item.checked { background: #f0fdf4; border-color: #bbf7d0; }
        .tp-checkbox {
          width: 20px; height: 20px; border-radius: 6px; border: 2px solid #d1d5db;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s; font-size: 0.75rem;
        }
        .tp-checkbox.checked { background: #22c55e; border-color: #22c55e; color: #fff; }
        .tp-checkbox.disabled-checked { background: #d1d5db; border-color: #d1d5db; color: #fff; }
        .tp-check-label { font-size: 0.88rem; color: #333; }
        .tp-check-label.checked { color: #166534; }
        .tp-check-label.disabled { color: #aaa; }
        .tp-notas-label { font-size: 0.8rem; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .tp-notas {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 10px 12px; font-size: 0.88rem; color: #333; resize: vertical;
          min-height: 80px; font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.15s;
        }
        .tp-notas:focus { border-color: #111; }
        .tp-notas:disabled { background: #f9fafb; color: #aaa; cursor: default; }
        .tp-modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
        .tp-save-btn {
          padding: 10px 24px; background: #111; color: #fff; border: none;
          border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .tp-save-btn:hover { background: #333; }
        .tp-save-btn:disabled { background: #e5e7eb; color: #aaa; cursor: default; }
        .tp-save-btn.saved { background: #22c55e; }
        .tp-completada-badge {
          display: flex; align-items: center; gap: 6px; font-size: 0.8rem;
          color: #22c55e; font-weight: 600; padding: 8px 14px;
          background: #f0fdf4; border-radius: 10px; border: 1.5px solid #bbf7d0;
        }
        .tp-empty { text-align: center; padding: 60px 20px; color: #aaa; font-size: 0.9rem; }
        .tp-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
      `}</style>

      <div className="tp-root">
        {/* HEADER */}
        <div className="flex justify-between flex-wrap gap-3 mb-1">
          <div>
            <h1 className="tp-title">Tareas Pendientes</h1>
            <p className="tp-sub">Tus visitas y actividades asignadas</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="tp-filters">
          {[
            { key: "todas", label: "Todas" },
            { key: "pendientes", label: `Pendientes (${pendientes.length})` },
            { key: "completadas", label: `Completadas (${completadas.length})` },
          ].map((f) => (
            <button
              key={f.key}
              className={`tp-filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* STATS */}
        <div className="tp-stats">
          <div className="tp-stat">
            <div className="tp-stat-label">Total asignadas</div>
            <div className="tp-stat-val">{tareas.length}</div>
          </div>
          <div className="tp-stat">
            <div className="tp-stat-label">Pendientes</div>
            <div className="tp-stat-val" style={{ color: "#ef4444" }}>{pendientes.length}</div>
          </div>
          <div className="tp-stat">
            <div className="tp-stat-label">Completadas</div>
            <div className="tp-stat-val" style={{ color: "#22c55e" }}>{completadas.length}</div>
          </div>
        </div>

        {/* GRID DE CARDS */}
        {filtered.length === 0 ? (
          <div className="tp-empty">
            <div className="tp-empty-icon">🎉</div>
            <div>No hay tareas en esta categoría</div>
          </div>
        ) : (
          <div className="tp-grid">
            {filtered.map((tarea) => {
              const total = Object.keys(tarea.checkboxes).length;
              const done = checkedCount(tarea);
              const pct = Math.round((done / total) * 100);
              return (
                <div
                  key={tarea.id}
                  className={`tp-card ${tarea.completada ? "completada" : ""}`}
                  onClick={() => openModal(tarea)}
                >
                  <div className={`tp-card-accent ${tarea.completada ? "done" : ""}`} />
                  <div className="tp-card-header">
                    <div style={{ paddingLeft: 8 }}>
                      <div className="tp-empresa">{tarea.empresa}</div>
                      <div className="tp-nit">{tarea.nit}</div>
                    </div>
                    <span className={`tp-badge ${tarea.completada ? "done" : "pending"}`}>
                      {tarea.completada ? "✓ Lista" : "Pendiente"}
                    </span>
                  </div>
                  <div className="tp-info" style={{ paddingLeft: 8 }}>
                    <div className="tp-info-row">
                      <span className="tp-info-icon">📍</span>
                      <span>{tarea.ciudad}</span>
                    </div>
                    <div className="tp-info-row">
                      <span className="tp-info-icon">👤</span>
                      <span>{tarea.contacto}</span>
                    </div>
                    <div className="tp-info-row">
                      <span className="tp-info-icon">📅</span>
                      <span>{tarea.fechaVisita}</span>
                    </div>
                  </div>
                  <div style={{ paddingLeft: 8 }}>
                    <div className="tp-progress-bar">
                      <div
                        className={`tp-progress-fill ${tarea.completada ? "done" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="tp-progress-label">{done}/{total} tareas completadas</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="tp-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="tp-modal">
            <div className="tp-modal-header">
              <div>
                <div className="tp-modal-title">{selected.empresa}</div>
                <div className="tp-modal-nit">NIT: {selected.nit}</div>
              </div>
              <button className="tp-close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="tp-modal-body">
              <div className="tp-modal-info">
                {[
                  { label: "Ciudad", val: selected.ciudad },
                  { label: "Teléfono", val: selected.telefono },
                  { label: "Contacto", val: selected.contacto },
                  { label: "Fecha visita", val: selected.fechaVisita },
                ].map((item) => (
                  <div key={item.label} className="tp-modal-info-item">
                    <div className="tp-modal-info-label">{item.label}</div>
                    <div className="tp-modal-info-val">{item.val}</div>
                  </div>
                ))}
              </div>

              <div className="tp-section-title">Actividades de la visita</div>
              <div className="tp-check-list">
                {Object.entries(CHECKBOX_LABELS).map(([key, label]) => {
                  const isChecked = localChecks[key];
                  const isDisabled = selected.completada;
                  return (
                    <div
                      key={key}
                      className={`tp-check-item ${isDisabled ? "disabled" : ""} ${isChecked ? "checked" : ""}`}
                      onClick={() => handleCheck(key)}
                    >
                      <div className={`tp-checkbox ${isDisabled && isChecked ? "disabled-checked" : isChecked ? "checked" : ""}`}>
                        {isChecked && "✓"}
                      </div>
                      <span className={`tp-check-label ${isDisabled ? "disabled" : isChecked ? "checked" : ""}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="tp-notas-label">Notas de la visita</div>
              <textarea
                className="tp-notas"
                placeholder={selected.completada ? "Sin notas" : "Agrega observaciones de la visita..."}
                value={localNotas}
                onChange={(e) => handleNotas(e.target.value)}
                disabled={selected.completada}
              />
            </div>
            <div className="tp-modal-footer">
              {selected.completada ? (
                <div className="tp-completada-badge">
                  ✓ Visita completada — solo lectura
                </div>
              ) : (
                <button
                  className={`tp-save-btn ${saved ? "saved" : ""}`}
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                >
                  {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </LayoutDashboard>
  );
}
