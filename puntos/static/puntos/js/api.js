// Comunicación con el backend. El resto del código no usa fetch directamente.

import { CSRF, URL_API_PUNTOS } from "./config.js";

/** Error que devuelve el backend. errores tiene la forma { campo: [mensajes] }. */
export class ErrorDeApi extends Error {
  constructor(estado, errores) {
    super(`El servidor respondió ${estado}`);
    this.errores = errores;
  }
}

/** Pide los puntos al backend y devuelve la lista. */
export async function listarPuntos() {
  const cuerpo = await pedir(URL_API_PUNTOS);
  return cuerpo.puntos;
}

/** Crea un punto y devuelve el punto guardado. */
export async function crearPunto(datos) {
  const cuerpo = await pedir(URL_API_PUNTOS, { metodo: "POST", datos });
  return cuerpo.punto;
}

/**
 * Hace un pedido a la API y devuelve el JSON de la respuesta.
 * Si el backend responde con un error, lanza ErrorDeApi.
 */
async function pedir(url, { metodo = "GET", datos } = {}) {
  const opciones = { method: metodo, headers: {} };
  if (metodo !== "GET") {
    opciones.headers[CSRF.cabecera] = leerCookie(CSRF.cookie);
  }
  if (datos !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(datos);
  }

  const respuesta = await fetch(url, opciones);
  const cuerpo = await leerJson(respuesta);
  if (!respuesta.ok) {
    throw new ErrorDeApi(respuesta.status, cuerpo?.errores ?? {});
  }
  return cuerpo;
}

/** Devuelve el JSON de la respuesta, o null si no trae JSON. */
async function leerJson(respuesta) {
  try {
    return await respuesta.json();
  } catch {
    return null;
  }
}

function leerCookie(nombre) {
  // document.cookie es un texto con la forma "a=1; b=2".
  for (const par of document.cookie.split("; ")) {
    const [clave, valor] = par.split("=");
    if (clave === nombre) return decodeURIComponent(valor);
  }
  return "";
}
