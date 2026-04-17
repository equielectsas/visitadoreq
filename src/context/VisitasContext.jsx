"use client";

import { createContext, useContext, useState } from "react";

const VisitasContext = createContext();

export function VisitasProvider({ children }) {

  const [visitas, setVisitas] = useState([]);

  // ➕ crear visita
  const agregarVisita = (visita) => {
    setVisitas((prev) => [...prev, visita]);
  };

  // ✏️ actualizar visita
  const actualizarVisita = (id, data) => {
    setVisitas((prev) =>
      prev.map((v) => (v.id == id ? { ...v, ...data } : v))
    );
  };

  return (
    <VisitasContext.Provider
      value={{ visitas, agregarVisita, actualizarVisita }}
    >
      {children}
    </VisitasContext.Provider>
  );
}

export function useVisitas() {
  return useContext(VisitasContext);
}