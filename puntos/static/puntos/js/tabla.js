// El listado de puntos.

import { DECIMALES_COORDENADA, ESTADOS } from "./config.js";

const MENSAJES_VACIO = {
  sinPuntos: "Todavía no hay puntos cargados.",
  sinCoincidencias: "Ningún punto coincide con la búsqueda.",
};

/**
 * Prepara la tabla y devuelve sus operaciones.
 * alEditar, alEliminar y alSeleccionar son funciones que reciben el punto
 * de la fila.
 */
export function crearTabla({ alEditar, alEliminar, alSeleccionar }) {
  const cuerpo = document.getElementById("tabla-puntos-cuerpo");
  const mensajeVacio = document.getElementById("listado-vacio");
  const buscador = document.getElementById("buscador");
  const cantidad = document.getElementById("listado-cantidad");

  // Todos los puntos recibidos; la búsqueda decide cuáles se dibujan.
  let todos = [];

  /** Reemplaza los puntos del listado por los de la lista recibida. */
  function mostrarPuntos(puntos) {
    todos = puntos;
    dibujar();
  }

  /** Dibuja las filas de los puntos que coinciden con la búsqueda. */
  function dibujar() {
    const buscado = normalizar(buscador.value.trim());
    const visibles = todos.filter((punto) =>
      normalizar(punto.nombre).includes(buscado)
    );

    cuerpo.replaceChildren(...visibles.map(crearFila));
    cantidad.textContent =
      visibles.length === todos.length
        ? `(${todos.length})`
        : `(${visibles.length} de ${todos.length})`;
    mensajeVacio.textContent =
      todos.length === 0
        ? MENSAJES_VACIO.sinPuntos
        : MENSAJES_VACIO.sinCoincidencias;
    mensajeVacio.hidden = visibles.length > 0;
  }

  // La búsqueda filtra los puntos ya cargados, sin pedirle nada al backend.
  buscador.addEventListener("input", dibujar);

  function crearFila(punto) {
    const fila = document.createElement("tr");
    fila.append(
      crearCelda(
        crearBoton(punto.nombre, "tabla__nombre", () => alSeleccionar(punto))
      ),
      crearCelda(crearEtiquetaEstado(punto.estado)),
      crearCelda(crearCoordenadas(punto), "tabla__coordenadas"),
      crearCelda(crearAcciones(punto), "tabla__acciones")
    );
    return fila;
  }

  function crearAcciones(punto) {
    const acciones = document.createElement("div");
    acciones.className = "acciones";
    acciones.append(
      crearBoton("Editar", "boton", () => alEditar(punto)),
      crearBoton("Eliminar", "boton boton--peligro", () => alEliminar(punto))
    );
    return acciones;
  }

  return { mostrarPuntos };
}

/** Crea una celda. El contenido puede ser un texto o un elemento. */
function crearCelda(contenido, clase = "") {
  const celda = document.createElement("td");
  celda.className = clase;
  // append() inserta los textos como texto, nunca como HTML.
  celda.append(contenido);
  return celda;
}

function crearEtiquetaEstado(estado) {
  const etiqueta = document.createElement("span");
  etiqueta.className = `estado estado--${estado}`;
  etiqueta.textContent = ESTADOS[estado];
  return etiqueta;
}

function crearBoton(texto, clase, alHacerClic) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = clase;
  boton.textContent = texto;
  boton.addEventListener("click", alHacerClic);
  return boton;
}

/** Latitud y longitud en dos renglones, con la precisión que define el backend. */
function crearCoordenadas(punto) {
  const coordenadas = document.createElement("div");
  for (const valor of [punto.latitud, punto.longitud]) {
    const renglon = document.createElement("div");
    renglon.textContent = valor.toFixed(DECIMALES_COORDENADA);
    coordenadas.append(renglon);
  }
  return coordenadas;
}

/** Pasa a minúsculas y quita los acentos, para que "bahia" encuentre "Bahía". */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
