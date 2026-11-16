// Valores fijos de la pantalla, definidos una sola vez.

export const URL_API_PUNTOS = "/api/puntos/";

// Django entrega un token en esta cookie y lo exige de vuelta en esta cabecera
// en cada pedido que modifica datos (protección CSRF).
export const CSRF = { cookie: "csrftoken", cabecera: "X-CSRFToken" };

// Datos que define el backend (ver la vista inicio) y llegan escritos en la
// página como JSON: los nombres de los estados y la precisión de las coordenadas.
const configBackend = JSON.parse(
  document.getElementById("config-backend").textContent
);
export const ESTADOS = configBackend.estados;
export const DECIMALES_COORDENADA = configBackend.decimales_coordenada;

// Por debajo de este ancho el panel del listado arranca plegado, para que se
// vea el mapa. Coincide con la media query de estilos.css.
export const CONSULTA_PANTALLA_ANGOSTA = "(max-width: 700px)";

export const MAPA = {
  // Vista inicial cuando todavía no hay puntos: Argentina completa.
  centroInicial: [-38.4, -63.6],
  zoomInicial: 4,
  // Zoom máximo al encuadrar los puntos, para no acercar de más si hay uno solo.
  zoomMaximoAlEncuadrar: 14,
  // Margen en píxeles entre los puntos y el borde del mapa al encuadrar.
  margenAlEncuadrar: [40, 40],
  urlTeselas: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  // OpenStreetMap rechaza (403) los pedidos que no dicen desde qué sitio
  // vienen. Django, por seguridad, le indica al navegador que no lo informe
  // a otros sitios; acá se habilita solo para las imágenes del mapa, y se
  // envía únicamente el origen (http://localhost:8000), no la URL completa.
  politicaDeReferencia: "strict-origin-when-cross-origin",
  atribucion:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};
