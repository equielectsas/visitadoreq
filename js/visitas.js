let visitas = [];
let editIndex = null;

// CARGAR
document.addEventListener("DOMContentLoaded", render);

// RENDER TABLA
function render() {
    const tabla = document.getElementById("tablaVisitas");
    tabla.innerHTML = "";

    visitas.forEach((v, i) => {
        tabla.innerHTML += `
            <tr>
                <td>${v.cliente}</td>
                <td>${v.fecha}</td>
                <td>${v.hora}</td>
                <td><span class="status ${v.estado}">${v.estado}</span></td>
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
function guardarVisita() {
    const cliente = document.getElementById("cliente").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const estado = document.getElementById("estado").value;

    if (!cliente || !fecha || !hora) return alert("Completa los campos");

    const data = { cliente, fecha, hora, estado };

    if (editIndex === null) {
        visitas.push(data);
    } else {
        visitas[editIndex] = data;
        editIndex = null;
    }

    cerrarModal();
    render();
}

// EDITAR
function editar(i) {
    const v = visitas[i];

    document.getElementById("cliente").value = v.cliente;
    document.getElementById("fecha").value = v.fecha;
    document.getElementById("hora").value = v.hora;
    document.getElementById("estado").value = v.estado;

    editIndex = i;
    abrirModal();
}

// ELIMINAR
function eliminar(i) {
    if (confirm("Eliminar visita?")) {
        visitas.splice(i, 1);
        render();
    }
}

// LIMPIAR
function limpiar() {
    document.getElementById("cliente").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
    document.getElementById("estado").value = "pendiente";
}