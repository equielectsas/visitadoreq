"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { roleRoutes } from "@/utils/roleRoutes";
import Image from "next/image";


// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const IdCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M14 10h4M14 14h4" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  );

const SpinnerIcon = () => (
  <svg className="animate-spin w-5 h-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="10" />
    <path d="M7 13l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Shared animation styles ───────────────────────────────────────────────────
const MODAL_STYLES = `
  @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
  @keyframes scaleIn   { from { opacity:0; transform:scale(.85) } to { opacity:1; transform:scale(1) } }
  @keyframes bounceIn  {
    0%   { transform:scale(0) }
    60%  { transform:scale(1.15) }
    100% { transform:scale(1) }
  }
  @keyframes shakeIn {
    0%   { transform:scale(0) rotate(0deg) }
    50%  { transform:scale(1.15) rotate(-8deg) }
    65%  { transform:scale(1) rotate(6deg) }
    80%  { transform:scale(1) rotate(-4deg) }
    100% { transform:scale(1) rotate(0deg) }
  }
  @keyframes progressBar { from { width:0 } to { width:100% } }
  .anim-fadeIn   { animation: fadeIn .25s ease forwards }
  .anim-scaleIn  { animation: scaleIn .3s cubic-bezier(.34,1.56,.64,1) forwards }
  .anim-bounceIn { animation: bounceIn .5s cubic-bezier(.34,1.56,.64,1) .1s both }
  .anim-shakeIn  { animation: shakeIn .55s cubic-bezier(.34,1.56,.64,1) .05s both }
  .anim-progress { animation: progressBar 2s linear forwards }
`;

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm anim-fadeIn"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center gap-4 anim-scaleIn z-10 max-w-sm w-full max-h-[min(90dvh,32rem)] overflow-y-auto">
        <div className="absolute inset-0 rounded-2xl ring-4 ring-green-200 pointer-events-none" />

        {/* 👇 AQUÍ CAMBIAS EL ÍCONO POR EL GIF */}
        <div className="anim-bounceIn">
          <img
            src="/assets/gif/success.gif"
            alt="success"
            className="w-24 h-24 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          ¡Inicio Exitoso!
        </h2>

        <p className="text-gray-500 text-sm text-center">
          Bienvenido de vuelta. Redirigiendo al dashboard...
        </p>

        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-[#008000] rounded-full anim-progress" />
        </div>
      </div>

      <style>{MODAL_STYLES}</style>
    </div>
  );
}

// ── Error Modal ───────────────────────────────────────────────────────────────
function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm anim-fadeIn" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center gap-4 anim-scaleIn z-10 max-w-sm w-full max-h-[min(90dvh,32rem)] overflow-y-auto">
        <div className="absolute inset-0 rounded-2xl ring-4 ring-red-200 pointer-events-none" />
        <div className="anim-shakeIn"><ErrorCircleIcon /></div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Credenciales Incorrectas</h2>
        <p className="text-gray-500 text-sm text-center">
          {message || "La cedula o contrasena ingresada no es valida. Por favor intenta de nuevo."}
        </p>
        <button
          onClick={onClose}
          className="mt-2 w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-[.98] text-white font-bold text-sm tracking-wide shadow-md transition-all duration-200"
        >
          Intentar de nuevo
        </button>
      </div>
      <style>{MODAL_STYLES}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const STORAGE_KEY = "equielect_saved_credentials";

  const [cedula,       setCedula]       = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [errorModal,   setErrorModal]   = useState({ show: false, message: "" });

  // Restore saved credentials on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.cedula) {
        setCedula(saved.cedula);
        setPassword(saved.password || "");
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem(
        "user",
        JSON.stringify({
          nombre: data.nombre,
          rol:    data.rol,
          cedula: data.cedula,
          token:  data.token,
        })
      );
      if (data.token) localStorage.setItem("token", data.token);

      try {
        sessionStorage.setItem("equielect_just_logged_in_v1", "1");
        window.dispatchEvent(new Event("equielect-user-logged-in"));
      } catch {
        /* ignore */
      }

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ cedula, password }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      const route = roleRoutes[data.rol];
      if (!route) throw new Error("Rol no autorizado");

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push(route);
      }, 2200);

    } catch (err) {
      setErrorModal({
        show: true,
        message: err.message || "La cedula o contrasena no es valida.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

      {errorModal.show && (
        <ErrorModal
          message={errorModal.message}
          onClose={() => setErrorModal({ show: false, message: "" })}
        />
      )}

      <div className="min-h-screen min-h-[100dvh] w-full bg-gray-100 flex flex-col items-center justify-center box-border px-4 py-8 sm:px-6 sm:py-10">
        <div
          className="w-full max-w-md mx-auto flex flex-col justify-center shrink-0
          lg:max-w-screen-xl lg:mx-0 lg:flex-row lg:items-stretch lg:min-h-[min(100dvh,44rem)] lg:max-h-[calc(100dvh-4rem)]
          overflow-hidden rounded-2xl bg-gray-100 shadow-none sm:shadow-xl ring-1 ring-black/[0.04] sm:ring-0 lg:bg-transparent"
        >

          {/* LEFT PANEL */}
          <div className="w-full lg:w-1/2 xl:w-5/12 px-1 sm:px-8 lg:px-14 py-2 sm:pt-10 sm:pb-12 lg:py-14 bg-gray-100 flex flex-col justify-center items-center lg:items-stretch text-center lg:text-left">

            <div className="flex justify-center w-full mb-6 sm:mb-10">
            <Image
              src="/assets/img/login/logo.png"
              alt="Equielect"
              width={120}
              height={40}
              className="h-8 sm:h-9 w-auto max-w-[min(100%,140px)]"
              priority
            />
            </div>

            <div className="my-4 sm:my-6 border-b border-gray-300 w-full max-w-sm mx-auto lg:max-w-none">
              <span className="relative -bottom-3 inline-block px-3 sm:px-4 bg-gray-100 text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest">
                Iniciar sesion
              </span>
            </div>

            <form
              onSubmit={handleLogin}
              className="w-full max-w-sm mx-auto lg:max-w-none space-y-4 sm:space-y-5 mt-2 sm:mt-4 text-left"
            >

              {/* Cedula */}
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <IdCardIcon />
                </span>
                <input
                  type="text"
                  placeholder="Cedula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-xl bg-white border border-gray-300 text-base sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5C800] focus:border-transparent transition shadow-sm min-h-[48px]"
                />
              </div>

              {/* Contrasena */}
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-xl bg-white border border-gray-300 text-base sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5C800] focus:border-transparent transition shadow-sm min-h-[48px]"
                />
                <span className="absolute inset-y-0 right-4 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  <EyeIcon open={showPassword} />
                </span>
              </div>

              {/* Remember me toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 rounded-full bg-gray-300 peer-checked:bg-[#F5C800] transition-colors duration-200" />
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors leading-snug">
                  Recordar credenciales
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-[#F5C800] hover:bg-[#e0b500] active:scale-[.98] text-black font-bold text-base tracking-wide shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
              >
                {loading ? (
                  <><SpinnerIcon /> Ingresando...</>
                ) : (
                  "Ingresar"
                )}
              </button>

            </form>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 bg-white hidden lg:flex min-h-0">
            <div
              className="flex-1 bg-cover bg-center"
              style={{ backgroundImage: "url('/assets/img/login/principal.jpg')" }}
            />
          </div>

        </div>
      </div>
    </>
  );
}
