// Comunicación con el backend. El resto del código no usa fetch directamente.

import { URL_API_PUNTOS } from "./config.js";

/** Pide los puntos al backend y devuelve la lista. */
export async function listarPuntos() {
  const respuesta = await fetch(URL_API_PUNTOS);
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}`);
  }
  const datos = await respuesta.json();
  return datos.puntos;
}
