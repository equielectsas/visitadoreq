"use client";

import { useState } from "react";
import styles from "./empresas.module.css";

export default function EmpresasPage() {

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    ciudad: "",
    telefono: "",
    estado: "activa"
  });

  const abrirModal = (empresa: any = null, index: number | null = null) => {
    if (empresa) {
      setForm(empresa);
      setEditIndex(index);
    } else {
      setForm({
        nombre: "",
        nit: "",
        ciudad: "",
        telefono: "",
        estado: "activa"
      });
      setEditIndex(null);
    }

    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  const guardarEmpresa = () => {
    if (!form.nombre || !form.nit) {
      alert("Completa los campos");
      return;
    }

    if (editIndex !== null) {
      const nuevas = [...empresas];
      nuevas[editIndex] = form;
      setEmpresas(nuevas);
    } else {
      setEmpresas([...empresas, form]);
    }

    cerrarModal();
  };

  const eliminarEmpresa = (index: number) => {
    const nuevas = empresas.filter((_, i) => i !== index);
    setEmpresas(nuevas);
  };

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <h2>Gestión de Empresas</h2>
        <button onClick={() => abrirModal()} className={styles.btn}>
          + Nueva empresa
        </button>
      </div>

      {/* TABLA */}
      <div className={styles.card}>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>NIT</th>
              <th>Ciudad</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {empresas.map((e, i) => (
              <tr key={i}>
                <td>{e.nombre}</td>
                <td>{e.nit}</td>
                <td>{e.ciudad}</td>
                <td>{e.telefono}</td>
                <td>
                  <span className={`${styles.estado} ${styles[e.estado]}`}>
                    {e.estado}
                  </span>
                </td>
                <td>
                  <button onClick={() => abrirModal(e, i)} className={styles.btnSmall}>
                    Editar
                  </button>
                  <button onClick={() => eliminarEmpresa(i)} className={styles.btnDelete}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>

            <h3>{editIndex !== null ? "Editar empresa" : "Nueva empresa"}</h3>

            <input
              type="text"
              placeholder="Nombre empresa"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <input
              type="text"
              placeholder="NIT"
              value={form.nit}
              onChange={(e) => setForm({ ...form, nit: e.target.value })}
            />

            <input
              type="text"
              placeholder="Ciudad"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />

            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </select>

            <div className={styles.modalActions}>
              <button onClick={guardarEmpresa} className={styles.btn}>
                Guardar
              </button>
              <button onClick={cerrarModal} className={styles.btnCancel}>
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}