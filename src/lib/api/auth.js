/** Misma ruta que Express: app.use("/api/auth", …) + router.post("/login"). Usar URL relativa para Vercel rewrites → Heroku. */
const LOGIN_URL = "/api/auth/login";

export async function login({ cedula, password }) {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cedula, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || "Credenciales incorrectas");
  }
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify({
    cedula: data.cedula,
    nombre: data.nombre,
    rol: data.rol,
  }));
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("equielect_task_modal_dismiss_")) sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  return { user: { cedula: data.cedula, nombre: data.nombre, rol: data.rol }, token: data.token };
}
