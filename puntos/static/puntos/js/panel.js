// El panel flotante del listado: se puede plegar para ver más mapa.

import { CONSULTA_PANTALLA_ANGOSTA } from "./config.js";

const CLASE_PLEGADO = "panel--plegado";
const TEXTOS = { plegar: "Ocultar", desplegar: "Mostrar" };

export function crearPanel() {
  const panel = document.getElementById("panel-listado");
  const boton = document.getElementById("panel-alternar");

  function plegar(plegado) {
    panel.classList.toggle(CLASE_PLEGADO, plegado);
    boton.textContent = plegado ? TEXTOS.desplegar : TEXTOS.plegar;
    boton.setAttribute("aria-expanded", String(!plegado));
  }

  boton.addEventListener("click", () => {
    plegar(!panel.classList.contains(CLASE_PLEGADO));
  });

  const pantallaAngosta = window.matchMedia(CONSULTA_PANTALLA_ANGOSTA);

  /**
   * Cuántos píxeles del mapa cubre el panel: { derecha, abajo }.
   * En pantallas anchas está al costado y en las angostas, abajo.
   */
  function zonaTapada() {
    const marco = panel.parentElement.getBoundingClientRect();
    const caja = panel.getBoundingClientRect();
    if (pantallaAngosta.matches) {
      return { derecha: 0, abajo: marco.bottom - caja.top };
    }
    const plegado = panel.classList.contains(CLASE_PLEGADO);
    return { derecha: plegado ? 0 : marco.right - caja.left, abajo: 0 };
  }

  // En el celular arranca plegado: primero se ve el mapa.
  plegar(pantallaAngosta.matches);

  return { zonaTapada };
}
