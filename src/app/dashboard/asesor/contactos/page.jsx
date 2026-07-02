"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

const PAGE_SIZE = 12;
const EMPTY_CONTACT = {
  nombre: "",
  cargo: "",
  profesion: "",
  telefono: "",
  email: "",
  notas: "",
};

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
}

function formatFecha(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function empresaLabel(empresa) {
  if (!empresa) return "";
  return empresa.empresaNombre || empresa.nombre || `Cliente ${empresa.empresaNit || empresa.nit || ""}`.trim();
}

function contactoId(contacto) {
  return contacto?.id || contacto?._id || contacto?.contactoId || "";
}

function contactoCorreo(contacto) {
  return contacto?.email || contacto?.correo || "";
}

function getCurrentUserName() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.nombre || u?.name || u?.usuario || localStorage.getItem("nombre") || "un asesor";
  } catch {
    return localStorage.getItem("nombre") || "un asesor";
  }
}

function saludoContacto(contacto) {
  const cliente = String(contacto?.nombre || "").trim() || "cliente";
  const asesor = getCurrentUserName();
  return `Hola ${cliente}, hablas con ${asesor} de la empresa Equielect, qué gusto hablarte,`;
}

function whatsappUrl(contacto) {
  const raw = String(contacto?.telefono || "").replace(/\D/g, "");
  if (!raw) return "";
  const phone = raw.length === 10 && raw.startsWith("3") ? `57${raw}` : raw;
  return `https://wa.me/${phone}?text=${encodeURIComponent(saludoContacto(contacto))}`;
}

function gmailUrl(contacto) {
  const email = contactoCorreo(contacto).trim();
  if (!email) return "";
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: "Contacto Equielect",
    body: saludoContacto(contacto),
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function mapClienteToEmpresa(c) {
  const nombre = c?.nombrePunto
    ? `${c?.razonSocial || ""} - ${c.nombrePunto}`.trim()
    : (c?.razonSocial || c?.nombrePunto || "").trim();
  return {
    clienteId: String(c?._id || ""),
    empresaNombre: nombre || `Cliente ${c?.identificacion || ""}`.trim(),
    empresaNit: c?.identificacion || "",
    empresaCiudad: c?.ciudad || "",
    empresaDireccion: c?.direccion || "",
    empresaTelefono: c?.telefono || "",
    contactos: Array.isArray(c?.contactos) ? c.contactos : [],
  };
}

export default function ContactosAsesorPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [itemsMigrados, setItemsMigrados] = useState([]);
  const [totalMigrados, setTotalMigrados] = useState(0);
  const [searchMigrados, setSearchMigrados] = useState("");
  const [searchMigradosDebounced, setSearchMigradosDebounced] = useState("");
  const [pageMigrados, setPageMigrados] = useState(1);
  const [loadingMigrados, setLoadingMigrados] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openByClient, setOpenByClient] = useState({});
  const [openByClientMigrados, setOpenByClientMigrados] = useState({});
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [empresaContactos, setEmpresaContactos] = useState([]);
  const [loadingEmpresaContactos, setLoadingEmpresaContactos] = useState(false);
  const [contactModal, setContactModal] = useState({
    open: false,
    mode: "create",
    empresa: null,
    contacto: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setSearchMigradosDebounced(searchMigrados.trim()), 300);
    return () => clearTimeout(t);
  }, [searchMigrados]);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced]);

  useEffect(() => {
    setPageMigrados(1);
  }, [searchMigradosDebounced]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (searchDebounced) params.set("search", searchDebounced);
      const res = await fetch(`/api/clientes/con-contactos?${params.toString()}`, {
        headers: { Authorization: getToken() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudieron cargar los contactos.");
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setError(e?.message || "No se pudieron cargar los contactos.");
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounced]);

  const loadMigrados = useCallback(async () => {
    try {
      setLoadingMigrados(true);
      const params = new URLSearchParams({ page: String(pageMigrados), limit: String(PAGE_SIZE) });
      if (searchMigradosDebounced) params.set("search", searchMigradosDebounced);
      const res = await fetch(`/api/contactos-migrados/con-contactos?${params.toString()}`, {
        headers: { Authorization: getToken() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudieron cargar los contactos migrados.");
      setItemsMigrados(Array.isArray(data.items) ? data.items : []);
      setTotalMigrados(typeof data.total === "number" ? data.total : 0);
    } catch (e) {
      setItemsMigrados([]);
      setTotalMigrados(0);
      setError(e?.message || "No se pudieron cargar los contactos migrados.");
    } finally {
      setLoadingMigrados(false);
    }
  }, [pageMigrados, searchMigradosDebounced]);

  const loadContactosEmpresa = useCallback(async (empresa) => {
    const id = empresa?.clienteId;
    if (!id) {
      setEmpresaContactos([]);
      return;
    }
    try {
      setLoadingEmpresaContactos(true);
      const res = await fetch(`/api/clientes/${encodeURIComponent(id)}/contactos`, {
        headers: { Authorization: getToken() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudieron cargar los contactos de la empresa.");
      setEmpresaContactos(
        (Array.isArray(data.contactos) ? data.contactos : []).filter((c) => c?.isActive !== false)
      );
    } catch (e) {
      setEmpresaContactos([]);
      setError(e?.message || "No se pudieron cargar los contactos de la empresa.");
    } finally {
      setLoadingEmpresaContactos(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadMigrados();
  }, [loadMigrados]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const totalPagesMigrados = Math.max(1, Math.ceil(totalMigrados / PAGE_SIZE));
  const totalContactosActual = useMemo(
    () => items.reduce((acc, c) => acc + (Array.isArray(c.contactos) ? c.contactos.length : 0), 0),
    [items]
  );
  const totalContactosMigradosPagina = useMemo(
    () => itemsMigrados.reduce((acc, c) => acc + (Array.isArray(c.contactos) ? c.contactos.length : 0), 0),
    [itemsMigrados]
  );

  const selectEmpresa = useCallback(
    (empresa) => {
      setSelectedEmpresa(empresa);
      setSuccess("");
      setOpenByClient((prev) => ({ ...prev, [empresa.clienteId]: true }));
      void loadContactosEmpresa(empresa);
    },
    [loadContactosEmpresa]
  );

  const openCreate = useCallback((empresa = selectedEmpresa, nombreInicial = "") => {
    if (!empresa?.clienteId) {
      setError("Primero selecciona una empresa para vincular el contacto.");
      return;
    }
    setError("");
    setContactModal({
      open: true,
      mode: "create",
      empresa,
      contacto: { ...EMPTY_CONTACT, nombre: nombreInicial },
    });
  }, [selectedEmpresa]);

  const openEdit = useCallback((empresa, contacto) => {
    setError("");
    setContactModal({
      open: true,
      mode: "edit",
      empresa,
      contacto: {
        id: contactoId(contacto),
        nombre: contacto?.nombre || "",
        cargo: contacto?.cargo || "",
        profesion: contacto?.profesion || "",
        telefono: contacto?.telefono || "",
        email: contactoCorreo(contacto),
        notas: contacto?.notas || "",
      },
    });
  }, []);

  const closeModal = useCallback(() => {
    setContactModal({ open: false, mode: "create", empresa: null, contacto: null });
  }, []);

  const saveContact = useCallback(async ({ empresa, contacto, mode }) => {
    const clienteId = empresa?.clienteId;
    const nombre = String(contacto?.nombre || "").trim();
    const cargo = String(contacto?.cargo || "").trim();
    const telefono = String(contacto?.telefono || "").trim();
    const email = String(contacto?.email || "").trim();
    if (!clienteId) throw new Error("Selecciona la empresa del contacto.");
    if (!nombre || !cargo || !telefono || !email) {
      throw new Error("Completa nombre, cargo, teléfono y correo.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Ingresa un correo electrónico válido.");
    }

    const body = {
      nombre,
      cargo,
      telefono,
      email,
      profesion: String(contacto?.profesion || "").trim(),
      notas: String(contacto?.notas || "").trim(),
    };

    const isEdit = mode === "edit";
    const id = contactoId(contacto);
    if (isEdit && !id) throw new Error("No se encontró el ID del contacto para editar.");

    const url = isEdit
      ? `/api/clientes/${encodeURIComponent(clienteId)}/contactos/${encodeURIComponent(id)}`
      : `/api/clientes/${encodeURIComponent(clienteId)}/contactos`;
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", Authorization: getToken() },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "No se pudo guardar el contacto.");
    return data;
  }, []);

  const disableContact = useCallback(async (empresa, contacto) => {
    const id = contactoId(contacto);
    if (!empresa?.clienteId || !id) return;
    const ok = window.confirm(`¿Eliminar (desactivar) el contacto "${contacto?.nombre || "-"}"?`);
    if (!ok) return;
    try {
      setSaving(true);
      const res = await fetch(
        `/api/clientes/${encodeURIComponent(empresa.clienteId)}/contactos/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: getToken() },
          body: JSON.stringify({ isActive: false }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo eliminar el contacto.");
      setSuccess("Contacto eliminado.");
      await Promise.all([load(), selectedEmpresa?.clienteId === empresa.clienteId ? loadContactosEmpresa(empresa) : null]);
    } catch (e) {
      setError(e?.message || "No se pudo eliminar el contacto.");
    } finally {
      setSaving(false);
    }
  }, [load, loadContactosEmpresa, selectedEmpresa]);

  return (
    <LayoutDashboard>
      <ContactFormModal
        modal={contactModal}
        saving={saving}
        onClose={closeModal}
        onChange={(patch) =>
          setContactModal((prev) => ({
            ...prev,
            contacto: { ...prev.contacto, ...patch },
          }))
        }
        onSubmit={async () => {
          setSaving(true);
          setError("");
          setSuccess("");
          try {
            await saveContact(contactModal);
            const empresa = contactModal.empresa;
            closeModal();
            setSuccess(contactModal.mode === "edit" ? "Contacto actualizado." : "Contacto creado y vinculado a la empresa.");
            await Promise.all([load(), selectedEmpresa?.clienteId === empresa?.clienteId ? loadContactosEmpresa(empresa) : null]);
          } catch (e) {
            setError(e?.message || "No se pudo guardar el contacto.");
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-800">Contactos</h1>
          <p className="text-sm text-gray-500">
            Base actual del sistema y base migrada desde Excel, lado a lado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreate()}
          disabled={!selectedEmpresa}
          className="px-4 py-2 rounded-xl bg-[#1C355E] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Agregar contacto (base actual)
        </button>
      </div>

      {(error || success) && (
        <div className="mb-4 space-y-2">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">{error}</div>}
          {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">{success}</div>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {/* ── COLUMNA IZQUIERDA: BASE ACTUAL ── */}
        <ContactosColumn
          title="Contactos base actual"
          subtitle="Contactos vinculados en el sistema (~60 registrados por asesores)."
          badgeClass="bg-[#1C355E] text-white"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar empresa, NIT, contacto, cargo o teléfono..."
          loading={loading}
          items={items}
          total={total}
          totalContactosPagina={totalContactosActual}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          openByClient={openByClient}
          setOpenByClient={setOpenByClient}
          onSelectEmpresa={selectEmpresa}
          onCreate={(empresa) => openCreate(empresa)}
          onEdit={openEdit}
          onDelete={disableContact}
          emptyMessage={searchDebounced ? "No hay coincidencias con la búsqueda." : "Aún no hay contactos en la base actual."}
          headerExtra={
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1">Vincular contacto a empresa</p>
                <EmpresaSearch onSelect={selectEmpresa} />
              </div>
              {selectedEmpresa && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700 font-bold">Empresa seleccionada</p>
                  <p className="text-sm font-black text-gray-900 mt-1">{empresaLabel(selectedEmpresa)}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-mono">{selectedEmpresa.empresaNit || "-"}</span>
                    {selectedEmpresa.empresaCiudad ? ` · ${selectedEmpresa.empresaCiudad}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => openCreate(selectedEmpresa)}
                    className="mt-2 px-3 py-2 rounded-lg bg-[#1C355E] text-white text-xs font-bold"
                  >
                    Crear contacto vinculado
                  </button>
                </div>
              )}
              {selectedEmpresa && (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-600">Contactos de la empresa seleccionada</p>
                    {loadingEmpresaContactos && <span className="text-[10px] text-gray-400">Cargando...</span>}
                  </div>
                  {empresaContactos.length === 0 ? (
                    <p className="p-4 text-xs text-gray-400">Sin contactos activos en esta empresa.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {empresaContactos.map((ct, i) => (
                        <ContactMiniCard
                          key={contactoId(ct) || `${ct.nombre}-${i}`}
                          contacto={ct}
                          onEdit={() => openEdit(selectedEmpresa, ct)}
                          onDelete={() => disableContact(selectedEmpresa, ct)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          }
        />

        {/* ── COLUMNA DERECHA: BASE MIGRADA ── */}
        <ContactosColumn
          title="Contactos base migrada"
          subtitle="Contactos importados desde Excel (base histórica)."
          badgeClass="bg-amber-500 text-white"
          search={searchMigrados}
          onSearchChange={setSearchMigrados}
          searchPlaceholder="Buscar empresa, nombre, cargo, teléfono o ciudad..."
          loading={loadingMigrados}
          items={itemsMigrados}
          total={totalMigrados}
          totalContactosPagina={totalContactosMigradosPagina}
          page={pageMigrados}
          totalPages={totalPagesMigrados}
          onPageChange={setPageMigrados}
          openByClient={openByClientMigrados}
          setOpenByClient={setOpenByClientMigrados}
          readOnly
          emptyMessage={searchMigradosDebounced ? "No hay coincidencias en la base migrada." : "Aún no hay contactos migrados. Un admin puede importarlos en Automatización."}
        />
      </div>
    </LayoutDashboard>
  );
}

function ContactosColumn({
  title,
  subtitle,
  badgeClass,
  search,
  onSearchChange,
  searchPlaceholder,
  loading,
  items,
  total,
  totalContactosPagina,
  page,
  totalPages,
  onPageChange,
  openByClient,
  setOpenByClient,
  onSelectEmpresa,
  onCreate,
  onEdit,
  onDelete,
  readOnly = false,
  emptyMessage,
  headerExtra = null,
}) {
  return (
    <section className="bg-white border rounded-2xl overflow-hidden min-h-[520px] flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-start gap-3">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex-shrink-0 ${badgeClass}`}>
            {readOnly ? "Migrada" : "Actual"}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Card compact label="Empresas" value={total} loading={loading} />
          <Card compact label="Contactos (pág.)" value={totalContactosPagina} loading={loading} />
        </div>
        {headerExtra && <div className="mt-4 pt-4 border-t border-gray-100">{headerExtra}</div>}
      </div>

      <div className="p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
      </div>

      <div className="flex-1">
        {loading && items.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">Cargando contactos...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm px-4">{emptyMessage}</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((empresa) => {
              const contactos = Array.isArray(empresa.contactos) ? empresa.contactos : [];
              const key = empresa.clienteId || empresa.empresaNombre;
              const isOpen = Boolean(openByClient[key]);
              return (
                <div key={key} className="p-4">
                  <div className="flex flex-wrap gap-3 justify-between">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setOpenByClient((prev) => ({ ...prev, [key]: !isOpen }))}
                    >
                      <p className="font-semibold text-gray-900 truncate">{empresa.empresaNombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {empresa.empresaNit ? <span className="font-mono">{empresa.empresaNit}</span> : null}
                        {empresa.empresaNit && empresa.empresaCiudad ? " · " : null}
                        {empresa.empresaCiudad || null}
                        {empresa.empresaDireccion ? ` · ${empresa.empresaDireccion}` : ""}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {contactos.length} contacto{contactos.length === 1 ? "" : "s"}
                      </p>
                    </button>
                    <div className="flex flex-wrap gap-2 items-start">
                      {!readOnly && onSelectEmpresa && (
                        <button
                          type="button"
                          onClick={() => onSelectEmpresa(empresa)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 font-bold hover:bg-gray-50"
                        >
                          Usar empresa
                        </button>
                      )}
                      {!readOnly && onCreate && (
                        <button
                          type="button"
                          onClick={() => onCreate(empresa)}
                          className="px-3 py-2 rounded-lg bg-[#1C355E] text-white text-xs font-bold"
                        >
                          + Contacto
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setOpenByClient((prev) => ({ ...prev, [key]: !isOpen }))}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600"
                      >
                        {isOpen ? "Ocultar" : "Ver"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm min-w-[640px] border border-gray-100 rounded-xl overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            {(readOnly
                              ? ["Nombre", "Cargo", "Teléfono", "Correo", "Ciudad"]
                              : ["Nombre", "Cargo", "Teléfono", "Correo", "Registro", "Acciones"]
                            ).map((h) => (
                              <th key={h} className="px-3 py-2 text-left text-xs text-gray-400 border-b font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {contactos.map((ct, i) =>
                            readOnly ? (
                              <ContactoMigradoRow key={contactoId(ct) || `${ct.nombre}-${i}`} contacto={ct} />
                            ) : (
                              <ContactRow
                                key={contactoId(ct) || `${ct.nombre}-${i}`}
                                contacto={ct}
                                onEdit={() => onEdit(empresa, ct)}
                                onDelete={() => onDelete(empresa, ct)}
                              />
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 p-3 text-xs text-gray-600 border-t border-gray-100 mt-auto">
        <span>
          {total > 0 ? `Mostrando ${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, total)} de ${total} empresas` : "Sin resultados"}
        </span>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="tabular-nums">{page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactoMigradoRow({ contacto }) {
  const wa = whatsappUrl(contacto);
  const gmail = gmailUrl(contacto);
  const extra = [contacto.ciudad, contacto.departamento].filter(Boolean).join(", ");
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="px-3 py-2 font-semibold text-gray-900">
        {contacto.nombre || "-"}
        <span className="ml-1 text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">Migrado</span>
      </td>
      <td className="px-3 py-2 text-gray-700 max-w-[200px]">
        {contacto.cargo || "-"}
        {contacto.nivelInfluencia ? <p className="text-[10px] text-gray-400 mt-0.5">{contacto.nivelInfluencia}</p> : null}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-gray-800 whitespace-nowrap">
        {wa ? (
          <a href={wa} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold">
            {contacto.telefono}
          </a>
        ) : contacto.telefono || "-"}
      </td>
      <td className="px-3 py-2 text-xs text-gray-600 break-all max-w-[180px]">
        {gmail ? (
          <a href={gmail} target="_blank" rel="noreferrer" className="text-blue-700 font-bold">
            {contactoCorreo(contacto)}
          </a>
        ) : contactoCorreo(contacto) || "-"}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500">{extra || "-"}</td>
    </tr>
  );
}

function EmpresaSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const tRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchEmpresa = (val) => {
    setQuery(val);
    if (tRef.current) clearTimeout(tRef.current);
    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    tRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: "1", limit: "10", search: val.trim() });
        const res = await fetch(`/api/clientes?${params.toString()}`, {
          headers: { Authorization: getToken() },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "No se pudieron buscar empresas.");
        const list = Array.isArray(data?.clientes)
          ? data.clientes
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
        setResults(list.map(mapClienteToEmpresa).filter((e) => e.clienteId));
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={(e) => searchEmpresa(e.target.value)}
        onFocus={() => query && setOpen(true)}
        placeholder="Buscar por empresa o NIT..."
        className="w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20"
      />
      {loading && (
        <span className="absolute right-3 top-3.5 w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
      )}
      {open && (
        <div className="absolute z-30 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400">No hay coincidencias.</p>
          ) : (
            results.map((empresa) => (
              <button
                key={empresa.clienteId}
                type="button"
                onClick={() => {
                  setQuery(empresaLabel(empresa));
                  setOpen(false);
                  onSelect(empresa);
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#1C355E]/5 border-b border-gray-50 last:border-0"
              >
                <p className="text-sm font-bold text-gray-800 truncate">{empresaLabel(empresa)}</p>
                <p className="text-xs text-gray-400">
                  <span className="font-mono">{empresa.empresaNit || "-"}</span>
                  {empresa.empresaCiudad ? ` · ${empresa.empresaCiudad}` : ""}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ContactFormModal({ modal, saving, onClose, onChange, onSubmit }) {
  if (!modal.open || !modal.contacto) return null;
  const isEdit = modal.mode === "edit";
  const c = modal.contacto;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-[#1C355E] to-[#16294d] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-black">{isEdit ? "Editar contacto" : "Nuevo contacto"}</p>
            <p className="text-white/60 text-xs mt-0.5">{empresaLabel(modal.empresa) || "Empresa vinculada"}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="text-white/80 hover:text-white">
            Cerrar
          </button>
        </div>

        <div className="p-6 space-y-4">
          <FormInput label="Nombre completo" required value={c.nombre} onChange={(v) => onChange({ nombre: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput label="Cargo" required value={c.cargo} onChange={(v) => onChange({ cargo: v })} />
            <FormInput label="Profesión" value={c.profesion} onChange={(v) => onChange({ profesion: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput label="Teléfono" required type="tel" value={c.telefono} onChange={(v) => onChange({ telefono: v })} />
            <FormInput label="Correo" required type="email" value={c.email} onChange={(v) => onChange({ email: v })} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notas</label>
            <textarea
              value={c.notas}
              onChange={(e) => onChange({ notas: e.target.value })}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium min-h-[90px]"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500">
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#1C355E] text-white font-bold text-sm disabled:opacity-50"
            >
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear y vincular"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, required, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1C355E]/20"
      />
    </div>
  );
}

function ContactMiniCard({ contacto, onEdit, onDelete }) {
  const wa = whatsappUrl(contacto);
  const gmail = gmailUrl(contacto);
  return (
    <div className="p-3">
      <p className="text-sm font-bold text-gray-900">{contacto.nombre || "-"}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        {[contacto.cargo, contacto.profesion].filter(Boolean).join(" · ") || "-"}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {wa && (
          <a href={wa} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-lg border text-xs font-bold text-emerald-700">
            WhatsApp
          </a>
        )}
        {gmail && (
          <a href={gmail} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-lg border text-xs font-bold text-blue-700">
            Gmail
          </a>
        )}
        <button type="button" onClick={onEdit} className="px-2 py-1 rounded-lg border text-xs font-bold text-gray-700">
          Editar
        </button>
        <button type="button" onClick={onDelete} className="px-2 py-1 rounded-lg border border-red-200 text-xs font-bold text-red-600">
          Eliminar
        </button>
      </div>
    </div>
  );
}

function ContactRow({ contacto, onEdit, onDelete }) {
  const cargoParts = [contacto.cargo, contacto.profesion].filter(Boolean).join(" · ");
  const wa = whatsappUrl(contacto);
  const gmail = gmailUrl(contacto);
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="px-3 py-2 font-semibold text-gray-900">{contacto.nombre || "-"}</td>
      <td className="px-3 py-2 text-gray-700 max-w-[240px]">
        {cargoParts || "-"}
        {contacto.notas ? <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{contacto.notas}</p> : null}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-gray-800 whitespace-nowrap">
        {wa ? (
          <a href={wa} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold">
            {contacto.telefono}
          </a>
        ) : "-"}
      </td>
      <td className="px-3 py-2 text-xs text-gray-600 break-all max-w-[200px]">
        {gmail ? (
          <a href={gmail} target="_blank" rel="noreferrer" className="text-blue-700 font-bold">
            {contactoCorreo(contacto)}
          </a>
        ) : "-"}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{formatFecha(contacto.createdAt)}</td>
      <td className="px-3 py-2 text-xs whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onEdit} className="px-2 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold">
            Editar
          </button>
          <button type="button" onClick={onDelete} className="px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}

function Card({ label, value, loading, compact = false }) {
  return (
    <div className={`bg-white border rounded-xl ${compact ? "p-3" : "p-4"}`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`font-medium tabular-nums ${compact ? "text-lg" : "text-xl"}`}>{loading ? "..." : value}</p>
    </div>
  );
}
