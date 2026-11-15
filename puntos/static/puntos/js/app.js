// Punto de entrada: conecta la API con el mapa, la tabla y el formulario.

import { crearPunto, listarPuntos } from "./api.js";
import { crearFormulario } from "./formulario.js";
import { crearMapa } from "./mapa.js";
import { crearTabla } from "./tabla.js";

const formulario = crearFormulario({
  alGuardar: async (datos) => {
    await crearPunto(datos);
    await cargarPuntos();
  },
});
const mapa = crearMapa("mapa", { alHacerClic: formulario.abrirParaCrear });
const tabla = crearTabla({
  // Editar y eliminar se conectan en los pasos siguientes.
  alEditar: () => {},
  alEliminar: () => {},
});
const aviso = document.getElementById("aviso");

/**
 * Trae los puntos del backend y actualiza el mapa y la tabla.
 * Después de cada cambio se vuelve a pedir la lista: así la pantalla muestra
 * siempre lo que está guardado. Devuelve la lista, o null si falló.
 */
async function cargarPuntos() {
  try {
    const puntos = await listarPuntos();
    mapa.mostrarPuntos(puntos);
    tabla.mostrarPuntos(puntos);
    aviso.hidden = true;
    return puntos;
  } catch (error) {
    console.error(error);
    aviso.textContent =
      "No se pudieron cargar los puntos. Revisá la conexión y recargá la página.";
    aviso.hidden = false;
    return null;
  }
}

// Solo al abrir la página se acomoda el mapa para mostrar todos los puntos.
// Después de crear uno no, para no mover el mapa mientras se está trabajando.
const puntosIniciales = await cargarPuntos();
if (puntosIniciales) mapa.encuadrar(puntosIniciales);
