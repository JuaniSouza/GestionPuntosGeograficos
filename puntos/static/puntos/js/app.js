// Punto de entrada: conecta la API con el mapa, la tabla y las ventanas.

import {
  crearPunto,
  editarPunto,
  eliminarPunto,
  listarPuntos,
} from "./api.js";
import { crearConfirmacion } from "./confirmacion.js";
import { crearFiltros } from "./filtros.js";
import { crearFormulario } from "./formulario.js";
import { crearMapa } from "./mapa.js";
import { crearPanel } from "./panel.js";
import { crearTabla } from "./tabla.js";

const MENSAJES = {
  errorAlCargar:
    "No se pudieron cargar los puntos. Revisá la conexión y recargá la página.",
  errorAlEliminar: "No se pudo eliminar el punto. Intentá de nuevo.",
  confirmarEliminar: (punto) =>
    `¿Eliminar "${punto.nombre}"? Esta acción no se puede deshacer.`,
};

const panel = crearPanel();
const confirmacion = crearConfirmacion();
const formulario = crearFormulario({
  alGuardar: async (datos, punto) => {
    if (punto) {
      await editarPunto(punto.id, datos);
    } else {
      await crearPunto(datos);
    }
    await cargarPuntos();
  },
});
const mapa = crearMapa("mapa", { alHacerClic: formulario.abrirParaCrear });
const tabla = crearTabla({
  alEditar: formulario.abrirParaEditar,
  alEliminar: eliminar,
  alSeleccionar: (punto) => mapa.enfocar(punto, panel.zonaTapada()),
});
const filtros = crearFiltros({ alCambiar: mostrarPuntos });
const aviso = document.getElementById("aviso");

// Todos los puntos que devolvió el backend la última vez.
let puntos = [];

/** Dibuja en el mapa y en la tabla los puntos que pasan los filtros. */
function mostrarPuntos() {
  const visibles = filtros.aplicar(puntos);
  mapa.mostrarPuntos(visibles);
  tabla.mostrarPuntos(visibles, puntos.length);
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.hidden = false;
}

async function eliminar(punto) {
  const confirmado = await confirmacion.pedir(MENSAJES.confirmarEliminar(punto));
  if (!confirmado) return;

  let fallo = false;
  try {
    await eliminarPunto(punto.id);
  } catch (error) {
    console.error(error);
    fallo = true;
  }
  // Se recarga también si falló: si otro ya lo había borrado, desaparece.
  await cargarPuntos();
  if (fallo) mostrarAviso(MENSAJES.errorAlEliminar);
}

/**
 * Trae los puntos del backend y actualiza el mapa y la tabla.
 * Después de cada cambio se vuelve a pedir la lista: así la pantalla muestra
 * siempre lo que está guardado. Devuelve la lista, o null si falló.
 */
async function cargarPuntos() {
  try {
    puntos = await listarPuntos();
    mostrarPuntos();
    aviso.hidden = true;
    return puntos;
  } catch (error) {
    console.error(error);
    mostrarAviso(MENSAJES.errorAlCargar);
    return null;
  }
}

// Solo al abrir la página se acomoda el mapa para mostrar todos los puntos.
// Después de cada cambio no, para no mover el mapa mientras se está trabajando.
const puntosIniciales = await cargarPuntos();
if (puntosIniciales) mapa.encuadrar(puntosIniciales, panel.zonaTapada());
