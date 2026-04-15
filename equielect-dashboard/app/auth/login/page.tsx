"use client";

import { useEffect, useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {

  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar particles.js dinámicamente
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/particles.js";
    script.onload = () => {
      (window as any).particlesJS("particles-js", {
        particles: {
          number: { value: 60 },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.2, random: true },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.1,
            width: 1
          },
          move: {
            enable: true,
            speed: 1.5
          }
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: "grab" }
          }
        }
      });
    };

    document.body.appendChild(script);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cedula || !password) {
      alert("Completa los campos");
      return;
    }

    setLoading(true);

    console.log("Login:", { cedula, password });

    // Simulación
    setTimeout(() => {
      setLoading(false);
      alert("Login simulado");
    }, 1000);
  };

  return (
    <>
      {/* Fondo partículas */}
      <div id="particles-js" className={styles.particles}></div>

      <div className={styles.wrapper}>

        <div className={styles.container}>

          {/* IZQUIERDA */}
          <div className={styles.left}></div>

          {/* DERECHA */}
          <div className={styles.right}>

            <div className={styles.card}>

              <h4>Iniciar sesión</h4>
              <small>Accede con tus credenciales</small>

              <form onSubmit={handleLogin}>

                <input
                  type="text"
                  placeholder="Cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>

              </form>

              <a href="#">¿Olvidaste tu contraseña?</a>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}