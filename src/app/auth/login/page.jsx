"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { roleRoutes } from "@/utils/roleRoutes";

export default function LoginPage() {
  const router = useRouter();

  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      const route = roleRoutes[data.rol];
      if (!route) throw new Error("Rol no autorizado");

      router.push(route);

    } catch (err) {
      alert(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 shadow sm:rounded-lg flex flex-1">

        {/* LEFT */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 bg-gray-200">

          <div>
            <img
              src="/assets/img/login/logo.png"
              className="w-[60%] mx-auto"
            />
          </div>

          <div className="mt-12 flex flex-col items-center">
            <div className="w-full flex-1 mt-8">

              {/* TITLE */}
              <div className="my-10 border-b text-center">
                <div className="leading-none px-2 inline-block text-lg font-semibold text-black bg-gray-200">
                  Iniciar sesión
                </div>
              </div>

              {/* FORM */}
              <form onSubmit={handleLogin} className="mx-auto max-w-xs space-y-6">

                <input
                  type="text"
                  placeholder="Cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg bg-white border border-gray-300 text-sm focus:outline-none focus:border-gray-500 shadow-sm"
                />

                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg bg-white border border-gray-300 text-sm focus:outline-none focus:border-gray-500 shadow-sm"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-lg bg-[#FFC107] hover:bg-[#e6ad06] active:scale-95 text-black font-semibold transition duration-200 shadow-md disabled:opacity-50"
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>

              </form>

            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex-1 bg-gray-300 hidden lg:flex">
          <div
            className="flex-1 bg-no-repeat bg-center bg-cover"
            style={{
              backgroundImage: "url('/assets/img/login/il.png')",
            }}
          />
        </div>

      </div>
    </div>
  );
}