let empresas = [];
let editIndex = null;

// INICIO
document.addEventListener("DOMContentLoaded", render);

// RENDER
function render() {
    const tabla = document.getElementById("tablaEmpresas");
    tabla.innerHTML = "";

    empresas.forEach((e, i) => {
        tabla.innerHTML += `
            <tr>
                <td>${e.nombre}</td>
                <td>${e.nit}</td>
                <td>${e.ciudad}</td>
                <td>${e.telefono}</td>
                <td><span class="status ${e.estado}">${e.estado}</span></td>
                <td>
                    <button onclick="editar(${i})">✏️</button>
                    <button onclick="eliminar(${i})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// MODAL
function abrirModal() {
    document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
    limpiar();
}

// GUARDAR
function guardarEmpresa() {
    const nombre = document.getElementById("nombre").value;
    const nit = document.getElementById("nit").value;
    const ciudad = document.getElementById("ciudad").value;
    const telefono = document.getElementById("telefono").value;
    const estado = document.getElementById("estado").value;

    if (!nombre || !nit) {
        alert("Nombre y NIT son obligatorios");
        return;
    }

    const data = { nombre, nit, ciudad, telefono, estado };

    if (editIndex === null) {
        empresas.push(data);
    } else {
        empresas[editIndex] = data;
        editIndex = null;
    }

    cerrarModal();
    render();
}

// EDITAR
function editar(i) {
    const e = empresas[i];

    document.getElementById("nombre").value = e.nombre;
    document.getElementById("nit").value = e.nit;
    document.getElementById("ciudad").value = e.ciudad;
    document.getElementById("telefono").value = e.telefono;
    document.getElementById("estado").value = e.estado;

    editIndex = i;
    abrirModal();
}

// ELIMINAR
function eliminar(i) {
    if (confirm("¿Eliminar empresa?")) {
        empresas.splice(i, 1);
        render();
    }
}

// LIMPIAR
function limpiar() {
    document.getElementById("nombre").value = "";
    document.getElementById("nit").value = "";
    document.getElementById("ciudad").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("estado").value = "activa";
}