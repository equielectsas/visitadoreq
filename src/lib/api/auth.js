export async function login({ cedula, password }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
  return { user: { cedula: data.cedula, nombre: data.nombre, rol: data.rol }, token: data.token };
}
