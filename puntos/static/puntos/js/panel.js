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

  // En el celular arranca plegado: primero se ve el mapa.
  plegar(window.matchMedia(CONSULTA_PANTALLA_ANGOSTA).matches);
}
