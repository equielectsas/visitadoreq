"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("cedula", data.cedula);
        router.push("/dashboard");
      } else {
        alert(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
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
        <div className="relative w-full max-w-md px-4">

          {/* Panel login */}
          <div className="bg-white rounded-3xl flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.3)] p-10">
            <div className="w-full">

              {/* Logo / título */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#1C355E]">EQUIELECT</h2>
                <h4 className="text-lg font-semibold text-gray-800 mt-1">Iniciar sesión</h4>
                <small className="text-gray-400 text-sm">Accede con tus credenciales</small>
              </div>

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