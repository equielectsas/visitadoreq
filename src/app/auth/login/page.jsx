"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/particles.js";
    script.onload = () => {
      window.particlesJS("particles-js", {
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
            width: 1,
          },
          move: { enable: true, speed: 1.5 },
        },
        interactivity: {
          events: { onhover: { enable: true, mode: "grab" } },
        },
      });
    };
    document.body.appendChild(script);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!cedula || !password) {
      alert("Completa los campos");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Login simulado");
    }, 1000);
  };

  return (
    <>
      {/* Fondo partículas */}
      <div
        id="particles-js"
        className="fixed w-full h-full z-0"
        style={{
          background: "radial-gradient(circle at 20% 20%, #1C355E, #0f1f3a)",
        }}
      />

      {/* Wrapper centrado */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="relative w-[1000px] h-[600px]">

          {/* Panel izquierdo con imagen */}
          <div
            className="absolute left-0 top-0 w-[60%] h-full rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/img/login/left.png')", backgroundPosition: "center 60%" }}
          />

          {/* Panel derecho */}
          <div className="absolute right-0 top-0 w-[45%] h-full bg-white rounded-3xl rounded-tl-[40px] rounded-bl-[40px] flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
            <div className="w-4/5">
              <h4 className="text-xl font-semibold text-gray-800 mb-1">Iniciar sesión</h4>
              <small className="block text-gray-400 mb-6 text-sm">Accede con tus credenciales</small>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full h-[45px] rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:border-[#FFCD00] focus:ring-2 focus:ring-[#FFCD00]/25"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[45px] rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:border-[#FFCD00] focus:ring-2 focus:ring-[#FFCD00]/25"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[45px] rounded-xl bg-[#FFCD00] font-semibold text-sm text-gray-800 hover:bg-[#e6b800] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>
              </form>

              <a
                href="#"
                className="block mt-4 text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}