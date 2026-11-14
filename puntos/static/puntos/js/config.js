// Valores fijos de la pantalla, definidos una sola vez.

export const URL_API_PUNTOS = "/api/puntos/";

export const MAPA = {
  // Vista inicial cuando todavía no hay puntos: Argentina completa.
  centroInicial: [-38.4, -63.6],
  zoomInicial: 4,
  // Zoom máximo al encuadrar los puntos, para no acercar de más si hay uno solo.
  zoomMaximoAlEncuadrar: 14,
  // Margen en píxeles entre los puntos y el borde del mapa al encuadrar.
  margenAlEncuadrar: [40, 40],
  urlTeselas: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  atribucion:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};
