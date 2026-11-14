// Punto de entrada: conecta la API con el mapa.

import { listarPuntos } from "./api.js";
import { crearMapa } from "./mapa.js";

const mapa = crearMapa("mapa");
const aviso = document.getElementById("aviso");

async function cargarPuntos() {
  try {
    const puntos = await listarPuntos();
    mapa.mostrarPuntos(puntos);
    mapa.encuadrar(puntos);
    aviso.hidden = true;
  } catch (error) {
    console.error(error);
    aviso.textContent =
      "No se pudieron cargar los puntos. Revisá la conexión y recargá la página.";
    aviso.hidden = false;
  }
}

cargarPuntos();
