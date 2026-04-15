"use client";

import { useState } from "react";
import styles from "./visitas.module.css";

export default function VisitasPage() {

  const [visitas, setVisitas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
    cliente: "",
    fecha: "",
    hora: "",
    estado: "pendiente"
  });

  const abrirModal = (visita: any = null, index: number | null = null) => {
    if (visita) {
      setForm(visita);
      setEditIndex(index);
    } else {
      setForm({
        cliente: "",
        fecha: "",
        hora: "",
        estado: "pendiente"
      });
      setEditIndex(null);
    }

    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  const guardarVisita = () => {
    if (!form.cliente || !form.fecha || !form.hora) {
      alert("Completa los campos");
      return;
    }

    if (editIndex !== null) {
      const nuevas = [...visitas];
      nuevas[editIndex] = form;
      setVisitas(nuevas);
    } else {
      setVisitas([...visitas, form]);
    }

    cerrarModal();
  };

  const eliminarVisita = (index: number) => {
    const nuevas = visitas.filter((_, i) => i !== index);
    setVisitas(nuevas);
  };

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <h2>Gestión de Visitas</h2>
        <button onClick={() => abrirModal()} className={styles.btn}>
          + Nueva visita
        </button>
      </div>

      {/* TABLA */}
      <div className={styles.card}>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {visitas.map((v, i) => (
              <tr key={i}>
                <td>{v.cliente}</td>
                <td>{v.fecha}</td>
                <td>{v.hora}</td>
                <td>
                  <span className={`${styles.estado} ${styles[v.estado]}`}>
                    {v.estado}
                  </span>
                </td>
                <td>
                  <button onClick={() => abrirModal(v, i)} className={styles.btnSmall}>
                    Editar
                  </button>
                  <button onClick={() => eliminarVisita(i)} className={styles.btnDelete}>
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

            <h3>{editIndex !== null ? "Editar visita" : "Nueva visita"}</h3>

            <input
              type="text"
              placeholder="Cliente"
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            />

            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />

            <input
              type="time"
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
            />

            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="pendiente">Pendiente</option>
              <option value="proceso">En proceso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">No realizada</option>
            </select>

            <div className={styles.modalActions}>
              <button onClick={guardarVisita} className={styles.btn}>
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