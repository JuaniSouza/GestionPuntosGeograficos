// Validación en el navegador. Sirve para avisar rápido, sin esperar al
// servidor; la validación que decide es la del backend.
//
// Las reglas no se escriben acá: el navegador las lee de los atributos HTML
// de cada campo (required, min, max, step), que genera Django a partir del
// modelo, y deja el resultado en campo.validity. Este archivo solo traduce
// ese resultado a un mensaje.

import { DECIMALES_COORDENADA } from "./config.js";

/** Devuelve el mensaje de error del campo, o "" si su valor es válido. */
export function mensajeDeValidacion(campo) {
  const estado = campo.validity;
  if (estado.valid) return "";
  if (estado.badInput) return "Ingresá un número.";
  if (estado.valueMissing) return "Este campo es obligatorio.";
  if (estado.rangeUnderflow || estado.rangeOverflow) {
    return `Debe estar entre ${campo.min} y ${campo.max}.`;
  }
  if (estado.stepMismatch) {
    return `Usá hasta ${DECIMALES_COORDENADA} decimales.`;
  }
  if (estado.tooLong) return `Usá hasta ${campo.maxLength} caracteres.`;
  return "El valor no es válido.";
}
