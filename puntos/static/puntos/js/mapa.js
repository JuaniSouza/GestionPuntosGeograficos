// Todo lo relacionado con Leaflet. L es el objeto global que define leaflet.js.

import { MAPA } from "./config.js";

/** Crea el mapa dentro del elemento con ese id y devuelve sus operaciones. */
export function crearMapa(idElemento) {
  const mapa = L.map(idElemento).setView(MAPA.centroInicial, MAPA.zoomInicial);
  L.tileLayer(MAPA.urlTeselas, { attribution: MAPA.atribucion }).addTo(mapa);

  // Capa que agrupa los marcadores, para poder borrarlos todos juntos.
  const capaMarcadores = L.layerGroup().addTo(mapa);

  /** Reemplaza los marcadores por los de la lista recibida. */
  function mostrarPuntos(puntos) {
    capaMarcadores.clearLayers();
    for (const punto of puntos) {
      crearMarcador(punto).addTo(capaMarcadores);
    }
  }

  /** Mueve el mapa para que se vean todos los puntos. */
  function encuadrar(puntos) {
    if (puntos.length === 0) return;
    const coordenadas = puntos.map((punto) => [punto.latitud, punto.longitud]);
    mapa.fitBounds(coordenadas, {
      maxZoom: MAPA.zoomMaximoAlEncuadrar,
      padding: MAPA.margenAlEncuadrar,
    });
  }

  return { mostrarPuntos, encuadrar };
}

function crearMarcador(punto) {
  // El marcador es un <div> que se dibuja con CSS. La clase lleva el estado
  // del punto (marcador--activo / marcador--inactivo) y el color sale de la
  // hoja de estilos.
  const icono = L.divIcon({
    className: `marcador marcador--${punto.estado}`,
    iconSize: [22, 22],
    popupAnchor: [0, -12],
  });
  return L.marker([punto.latitud, punto.longitud], {
    icon: icono,
    title: punto.nombre,
  }).bindPopup(crearContenidoPopup(punto));
}

function crearContenidoPopup(punto) {
  // Se arma con textContent y no con HTML en texto: así, si un nombre trae
  // etiquetas (por ejemplo <script>), el navegador las muestra como texto y
  // no las ejecuta.
  const contenido = document.createElement("div");
  contenido.className = "popup";

  const nombre = document.createElement("strong");
  nombre.className = "popup__nombre";
  nombre.textContent = punto.nombre;
  contenido.append(nombre);

  if (punto.descripcion) {
    const descripcion = document.createElement("p");
    descripcion.className = "popup__descripcion";
    descripcion.textContent = punto.descripcion;
    contenido.append(descripcion);
  }
  return contenido;
}
