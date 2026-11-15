// El listado de puntos.

import { DECIMALES_COORDENADA, ESTADOS } from "./config.js";

/**
 * Prepara la tabla y devuelve sus operaciones.
 * alEditar y alEliminar son funciones que reciben el punto de la fila.
 */
export function crearTabla({ alEditar, alEliminar }) {
  const cuerpo = document.getElementById("tabla-puntos-cuerpo");
  const mensajeVacio = document.getElementById("listado-vacio");

  /** Reemplaza las filas por las de la lista recibida. */
  function mostrarPuntos(puntos) {
    cuerpo.replaceChildren(...puntos.map(crearFila));
    mensajeVacio.hidden = puntos.length > 0;
  }

  function crearFila(punto) {
    const fila = document.createElement("tr");
    fila.append(
      crearCelda(punto.nombre),
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
