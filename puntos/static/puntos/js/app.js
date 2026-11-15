// Punto de entrada: conecta la API con el mapa y la tabla.

import { listarPuntos } from "./api.js";
import { crearMapa } from "./mapa.js";
import { crearTabla } from "./tabla.js";

const mapa = crearMapa("mapa");
const tabla = crearTabla({
  // Editar y eliminar se conectan en los pasos siguientes.
  alEditar: () => {},
  alEliminar: () => {},
});
const aviso = document.getElementById("aviso");

async function cargarPuntos() {
  try {
    const puntos = await listarPuntos();
    mapa.mostrarPuntos(puntos);
    mapa.encuadrar(puntos);
    tabla.mostrarPuntos(puntos);
    aviso.hidden = true;
  } catch (error) {
    console.error(error);
    aviso.textContent =
      "No se pudieron cargar los puntos. Revisá la conexión y recargá la página.";
    aviso.hidden = false;
  }
}

cargarPuntos();
