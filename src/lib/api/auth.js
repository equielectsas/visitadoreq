// src/lib/api/auth.js

export async function login({ cedula, password }) {

  await new Promise((res) => setTimeout(res, 800));

  const users = [
    {
      cedula: "10123456",
      password: "123asesor",
      rol: "asesor",
      nombre: "Asesor Demo",
    },
    {
      cedula: "admin",
      password: "admin",
      rol: "admin",
      nombre: "Administrador",
    },
    {
      cedula: "1026198222",
      password: "jerolomon23",
      rol: "programador",
      nombre: "Dev 1",
    },
  ];

  const user = users.find(
    (u) => u.cedula === cedula && u.password === password
  );

  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  return {
    user,
    token: "fake-jwt",
  };
}