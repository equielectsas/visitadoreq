"use client";

import { useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

// ─── DATOS FAKE ───────────────────────────────────────────────────────────────
const MOCK_ASESORES = [
  {
    id: 1,
    nombre: "Carlos Mendoza",
    email: "c.mendoza@safix.co",
    avatar: "CM",
    alertaPendiente: false,
    tareas: [
      {
        id: 101,
        empresa: "Distribuidora Nacional S.A.S",
        nit: "900.123.456-7",
        ciudad: "Bogotá",
        telefono: "601 234 5678",
        contacto: "Luis Martínez",
        fechaVisita: "2025-04-20",
        completada: false,
        checkboxes: { presentacionProductos: true, demostracion: false, cotizacion: false, seguimientoPago: false, firmaContrato: false },
        notas: "Cliente interesado pero pendiente demo.",
      },
      {
        id: 102,
        empresa: "Grupo Logístico del Norte",
        nit: "700.456.789-1",
        ciudad: "Barranquilla",
        telefono: "605 456 7890",
        contacto: "Pedro Camacho",
        fechaVisita: "2025-04-22",
        completada: false,
        checkboxes: { presentacionProductos: false, demostracion: false, cotizacion: false, seguimientoPago: false, firmaContrato: false },
        notas: "",
      },
    ],
  },
  {
    id: 2,
    nombre: "Valentina Torres",
    email: "v.torres@safix.co",
    avatar: "VT",
    alertaPendiente: true,
    tareas: [
      {
        id: 201,
        empresa: "Comercial Andina Ltda.",
        nit: "800.987.654-3",
        ciudad: "Medellín",
        telefono: "604 345 6789",
        contacto: "Sandra Ríos",
        fechaVisita: "2025-04-18",
        completada: true,
        checkboxes: { presentacionProductos: true, demostracion: true, cotizacion: true, seguimientoPago: true, firmaContrato: true },
        notas: "Completada exitosamente.",
      },
      {
        id: 202,
        empresa: "Inversiones del Pacífico",
        nit: "890.321.654-2",
        ciudad: "Cali",
        telefono: "602 111 2233",
        contacto: "Jorge Ospina",
        fechaVisita: "2025-04-25",
        completada: false,
        checkboxes: { presentacionProductos: true, demostracion: false, cotizacion: false, seguimientoPago: false, firmaContrato: false },
        notas: "",
      },
    ],
  },
  {
    id: 3,
    nombre: "Diego Ramírez",
    email: "d.ramirez@safix.co",
    avatar: "DR",
    alertaPendiente: false,
    tareas: [
      {
        id: 301,
        empresa: "Soluciones Tech Caribe",
        nit: "901.234.567-8",
        ciudad: "Cartagena",
        telefono: "605 567 8901",
        contacto: "Marcela Herrera",
        fechaVisita: "2025-04-15",
        completada: false,
        checkboxes: { presentacionProductos: true, demostracion: true, cotizacion: false, seguimientoPago: false, firmaContrato: false },
        notas: "Esperando aprobación de presupuesto.",
      },
    ],
  },
];

const CHECKBOX_LABELS = {
  presentacionProductos: "Presentación de productos",
  demostracion: "Demostración del sistema",
  cotizacion: "Envío de cotización",
  seguimientoPago: "Seguimiento de pago",
  firmaContrato: "Firma de contrato",
};

export default function TareasPendientesAdmin() {
  const [asesores, setAsesores] = useState(MOCK_ASESORES);
  const [selectedTarea, setSelectedTarea] = useState(null);
  const [selectedAsesor, setSelectedAsesor] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmAlert, setConfirmAlert] = useState(null);
  const [filterAsesor, setFilterAsesor] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todas");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Simula envío de correo (fake)
  const handleEnviarCorreo = (asesor) => {
    showToast(`📧 Correo enviado a ${asesor.nombre} (${asesor.email})`);
  };

  // Simula alerta: activa el flag en el estado local (fake)
  const confirmarAlerta = () => {
    if (!confirmAlert) return;
    setAsesores((prev) =>
      prev.map((a) =>
        a.id === confirmAlert.id ? { ...a, alertaPendiente: true } : a
      )
    );
    showToast(`🔔 Alerta activada para ${confirmAlert.nombre}. La verá al próximo ingreso.`);
    setConfirmAlert(null);
  };

  const openTarea = (asesor, tarea) => {
    setSelectedAsesor(asesor);
    setSelectedTarea(tarea);
  };

  const asList = asesores
    .filter((a) => filterAsesor === "todos" || a.id.toString() === filterAsesor)
    .flatMap((a) =>
      a.tareas
        .filter((t) =>
          filterEstado === "todas"
            ? true
            : filterEstado === "pendientes"
            ? !t.completada
            : t.completada
        )
        .map((t) => ({ asesor: a, tarea: t }))
    );

  const todasTareas = asesores.flatMap((a) => a.tareas);
  const totalPendientes = todasTareas.filter((t) => !t.completada).length;
  const totalCompletadas = todasTareas.filter((t) => t.completada).length;
  const asesoresConPendientes = asesores.filter((a) => a.tareas.some((t) => !t.completada)).length;

  const checkedCount = (tarea) => Object.values(tarea.checkboxes).filter(Boolean).length;

  return (
    <LayoutDashboard>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');

        .adm-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .adm-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.5rem; color: #111; }
        .adm-sub { font-size: 0.85rem; color: #888; margin-top: 2px; }

        .adm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
        .adm-stat { background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 14px 16px; }
        .adm-stat-label { font-size: 0.72rem; color: #999; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .adm-stat-val { font-size: 1.5rem; font-weight: 700; color: #111; font-family: 'Syne', sans-serif; }

        .adm-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
        .adm-select {
          padding: 7px 12px; border-radius: 10px; border: 1.5px solid #e5e7eb;
          font-size: 0.82rem; color: #444; background: #fff; cursor: pointer;
          font-family: 'DM Sans', sans-serif; outline: none;
        }
        .adm-select:focus { border-color: #111; }
        .adm-filter-btn {
          padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e5e7eb;
          font-size: 0.8rem; font-weight: 500; cursor: pointer; background: #fff; color: #555; transition: all 0.15s;
        }
        .adm-filter-btn.active { background: #111; color: #fff; border-color: #111; }

        .adm-table-wrap { background: #fff; border: 1px solid #f0f0f0; border-radius: 16px; overflow: hidden; }
        .adm-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .adm-table thead tr { background: #f9fafb; }
        .adm-table th { padding: 10px 16px; text-align: left; font-size: 0.72rem; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f0f0f0; }
        .adm-table td { padding: 12px 16px; border-bottom: 1px solid #f8f8f8; vertical-align: middle; }
        .adm-table tbody tr:hover { background: #fafafa; }
        .adm-table tbody tr:last-child td { border-bottom: none; }

        .adm-avatar { width: 32px; height: 32px; border-radius: 50%; background: #111; color: #fff; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .adm-asesor-cell { display: flex; align-items: center; gap: 10px; }
        .adm-asesor-name { font-weight: 500; color: #111; font-size: 0.88rem; }
        .adm-asesor-email { font-size: 0.75rem; color: #aaa; }
        .adm-empresa { font-weight: 500; color: #111; }
        .adm-nit { font-size: 0.75rem; color: #aaa; font-family: monospace; }

        .adm-progress-bar { height: 5px; background: #f3f4f6; border-radius: 4px; width: 80px; }
        .adm-progress-fill { height: 100%; border-radius: 4px; background: #111; }
        .adm-progress-fill.done { background: #22c55e; }
        .adm-progress-label { font-size: 0.72rem; color: #aaa; margin-top: 3px; }

        .adm-badge { font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
        .adm-badge.pending { background: #fef2f2; color: #ef4444; }
        .adm-badge.done { background: #f0fdf4; color: #22c55e; }

        .adm-actions { display: flex; gap: 6px; }
        .adm-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e5e7eb;
          background: #fff; cursor: pointer; display: flex; align-items: center;
          justify-content: center; font-size: 0.9rem; transition: all 0.15s; position: relative;
        }
        .adm-btn:hover { border-color: #ccc; background: #f3f4f6; }
        .adm-btn.alert-btn:hover { background: #fef2f2; border-color: #fecaca; }
        .adm-btn.email-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
        .adm-btn.view-btn:hover { background: #f9fafb; border-color: #d1d5db; }
        .adm-btn[title]:hover::after {
          content: attr(title); position: absolute; bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%); background: #111; color: #fff; font-size: 0.7rem;
          padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none;
          font-family: 'DM Sans', sans-serif;
        }

        .adm-alerta-activa { font-size: 0.72rem; color: #ef4444; font-weight: 600; }
        .adm-alerta-no { font-size: 0.72rem; color: #f59e0b; font-weight: 600; }

        .adm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(4px); padding: 20px;
        }
        .adm-modal {
          background: #fff; border-radius: 20px; width: 100%; max-width: 500px;
          max-height: 88vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.18);
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .adm-modal-header {
          padding: 22px 24px 16px; border-bottom: 1px solid #f0f0f0;
          display: flex; justify-content: space-between; align-items: flex-start;
        }
        .adm-modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; color: #111; }
        .adm-modal-sub { font-size: 0.78rem; color: #aaa; margin-top: 2px; }
        .adm-close-btn {
          width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #e5e7eb;
          background: #fff; cursor: pointer; display: flex; align-items: center;
          justify-content: center; font-size: 1rem; color: #555; transition: all 0.15s;
        }
        .adm-close-btn:hover { background: #f3f4f6; }
        .adm-modal-body { padding: 20px 24px; }
        .adm-modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px; }
        .adm-info-item { background: #f9fafb; border-radius: 10px; padding: 10px 12px; }
        .adm-info-label { font-size: 0.7rem; color: #aaa; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
        .adm-info-val { font-size: 0.88rem; color: #111; font-weight: 500; }
        .adm-section-title { font-size: 0.78rem; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .adm-check-list-ro { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .adm-check-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; background: #f9fafb; }
        .adm-check-icon { font-size: 0.85rem; }
        .adm-check-text { font-size: 0.85rem; color: #444; }
        .adm-check-text.done { color: #166534; }
        .adm-notas-box { background: #f9fafb; border-radius: 10px; padding: 12px 14px; font-size: 0.85rem; color: #555; line-height: 1.6; min-height: 56px; }

        .adm-confirm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1100; backdrop-filter: blur(4px); padding: 20px;
        }
        .adm-confirm-modal {
          background: #fff; border-radius: 20px; width: 100%; max-width: 400px;
          padding: 28px 28px 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.2); animation: modalIn 0.2s ease;
        }
        .adm-confirm-icon { font-size: 2.2rem; text-align: center; margin-bottom: 12px; }
        .adm-confirm-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; color: #111; text-align: center; margin-bottom: 8px; }
        .adm-confirm-desc { font-size: 0.85rem; color: #666; text-align: center; line-height: 1.6; margin-bottom: 22px; }
        .adm-confirm-desc strong { color: #111; }
        .adm-confirm-btns { display: flex; gap: 10px; }
        .adm-confirm-cancel { flex: 1; padding: 10px; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fff; font-size: 0.88rem; color: #555; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .adm-confirm-cancel:hover { background: #f3f4f6; }
        .adm-confirm-ok { flex: 1; padding: 10px; border: none; border-radius: 10px; background: #ef4444; font-size: 0.88rem; color: #fff; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .adm-confirm-ok:hover { background: #dc2626; }

        .adm-toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 2000;
          background: #111; color: #fff; padding: 12px 20px;
          border-radius: 12px; font-size: 0.88rem; font-weight: 500;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2); animation: toastIn 0.2s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .adm-toast.error { background: #ef4444; }
        .adm-empty { text-align: center; padding: 50px; color: #aaa; font-size: 0.9rem; }
      `}</style>

      <div className="adm-root">
        <div className="flex justify-between flex-wrap gap-3 mb-1">
          <div>
            <h1 className="adm-title">Tareas Pendientes — Admin</h1>
            <p className="adm-sub">Gestión global de visitas y actividades de todos los asesores</p>
          </div>
        </div>

        <div className="adm-stats">
          <div className="adm-stat">
            <div className="adm-stat-label">Total tareas</div>
            <div className="adm-stat-val">{todasTareas.length}</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Pendientes</div>
            <div className="adm-stat-val" style={{ color: "#ef4444" }}>{totalPendientes}</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Completadas</div>
            <div className="adm-stat-val" style={{ color: "#22c55e" }}>{totalCompletadas}</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Asesores con pendientes</div>
            <div className="adm-stat-val" style={{ color: "#f59e0b" }}>{asesoresConPendientes}</div>
          </div>
        </div>

        <div className="adm-filters">
          <select className="adm-select" value={filterAsesor} onChange={(e) => setFilterAsesor(e.target.value)}>
            <option value="todos">Todos los asesores</option>
            {asesores.map((a) => (
              <option key={a.id} value={a.id.toString()}>{a.nombre}</option>
            ))}
          </select>
          {[
            { key: "todas", label: "Todas" },
            { key: "pendientes", label: "Pendientes" },
            { key: "completadas", label: "Completadas" },
          ].map((f) => (
            <button
              key={f.key}
              className={`adm-filter-btn ${filterEstado === f.key ? "active" : ""}`}
              onClick={() => setFilterEstado(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="adm-table-wrap">
          {asList.length === 0 ? (
            <div className="adm-empty">No hay tareas con estos filtros</div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Asesor</th>
                  <th>Empresa</th>
                  <th>Ciudad</th>
                  <th>Fecha visita</th>
                  <th>Progreso</th>
                  <th>Estado</th>
                  <th>Alerta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asList.map(({ asesor, tarea }) => {
                  const total = Object.keys(tarea.checkboxes).length;
                  const done = checkedCount(tarea);
                  const pct = Math.round((done / total) * 100);
                  return (
                    <tr key={tarea.id}>
                      <td>
                        <div className="adm-asesor-cell">
                          <div className="adm-avatar">{asesor.avatar}</div>
                          <div>
                            <div className="adm-asesor-name">{asesor.nombre}</div>
                            <div className="adm-asesor-email">{asesor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="adm-empresa">{tarea.empresa}</div>
                        <div className="adm-nit">{tarea.nit}</div>
                      </td>
                      <td>{tarea.ciudad}</td>
                      <td>{tarea.fechaVisita}</td>
                      <td>
                        <div className="adm-progress-bar">
                          <div className={`adm-progress-fill ${tarea.completada ? "done" : ""}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="adm-progress-label">{done}/{total}</div>
                      </td>
                      <td>
                        <span className={`adm-badge ${tarea.completada ? "done" : "pending"}`}>
                          {tarea.completada ? "✓ Completada" : "Pendiente"}
                        </span>
                      </td>
                      <td>
                        {tarea.completada ? (
                          <span style={{ color: "#ccc", fontSize: "0.75rem" }}>—</span>
                        ) : asesor.alertaPendiente ? (
                          <span className="adm-alerta-activa">🔴 Enviada</span>
                        ) : (
                          <span className="adm-alerta-no">— Sin alerta</span>
                        )}
                      </td>
                      <td>
                        <div className="adm-actions">
                          <button className="adm-btn view-btn" title="Ver detalle" onClick={() => openTarea(asesor, tarea)}>👁</button>
                          {!tarea.completada && (
                            <>
                              <button className="adm-btn alert-btn" title="Enviar alerta al asesor" onClick={() => setConfirmAlert(asesor)}>🔔</button>
                              <button className="adm-btn email-btn" title="Enviar correo al asesor" onClick={() => handleEnviarCorreo(asesor)}>✉️</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DETALLE TAREA */}
      {selectedTarea && selectedAsesor && (
        <div className="adm-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedTarea(null)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div>
                <div className="adm-modal-title">{selectedTarea.empresa}</div>
                <div className="adm-modal-sub">Asesor: {selectedAsesor.nombre} · NIT: {selectedTarea.nit}</div>
              </div>
              <button className="adm-close-btn" onClick={() => setSelectedTarea(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-modal-info-grid">
                {[
                  { label: "Ciudad", val: selectedTarea.ciudad },
                  { label: "Contacto", val: selectedTarea.contacto },
                  { label: "Fecha visita", val: selectedTarea.fechaVisita },
                  { label: "Estado", val: selectedTarea.completada ? "✓ Completada" : "Pendiente" },
                ].map((item) => (
                  <div key={item.label} className="adm-info-item">
                    <div className="adm-info-label">{item.label}</div>
                    <div className="adm-info-val">{item.val}</div>
                  </div>
                ))}
              </div>
              <div className="adm-section-title">Actividades</div>
              <div className="adm-check-list-ro">
                {Object.entries(CHECKBOX_LABELS).map(([key, label]) => {
                  const checked = selectedTarea.checkboxes[key];
                  return (
                    <div key={key} className="adm-check-row">
                      <span className="adm-check-icon">{checked ? "✅" : "⬜"}</span>
                      <span className={`adm-check-text ${checked ? "done" : ""}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="adm-section-title">Notas</div>
              <div className="adm-notas-box">
                {selectedTarea.notas || <span style={{ color: "#ccc" }}>Sin notas registradas</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ALERTA */}
      {confirmAlert && (
        <div className="adm-confirm-overlay">
          <div className="adm-confirm-modal">
            <div className="adm-confirm-icon">🔔</div>
            <div className="adm-confirm-title">Enviar alerta al asesor</div>
            <div className="adm-confirm-desc">
              Se activará una notificación en rojo para <strong>{confirmAlert.nombre}</strong> la próxima vez que ingrese al dashboard, recordándole sus tareas pendientes.
            </div>
            <div className="adm-confirm-btns">
              <button className="adm-confirm-cancel" onClick={() => setConfirmAlert(null)}>Cancelar</button>
              <button className="adm-confirm-ok" onClick={confirmarAlerta}>Enviar alerta</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={`adm-toast ${toast.type}`}>{toast.msg}</div>}
    </LayoutDashboard>
  );
}
