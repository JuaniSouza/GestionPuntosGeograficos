// Todo lo relacionado con Leaflet. L es el objeto global que define leaflet.js.

import { DECIMALES_COORDENADA, MAPA } from "./config.js";

/**
 * Crea el mapa dentro del elemento con ese id y devuelve sus operaciones.
 * alHacerClic recibe { latitud, longitud } del lugar donde se hizo clic.
 */
export function crearMapa(idElemento, { alHacerClic }) {
  const mapa = L.map(idElemento).setView(MAPA.centroInicial, MAPA.zoomInicial);
  L.tileLayer(MAPA.urlTeselas, {
    attribution: MAPA.atribucion,
    referrerPolicy: MAPA.politicaDeReferencia,
  }).addTo(mapa);

  agregarSenalesNauticas(mapa);
  agregarCoordenadasDelCursor(mapa);

  // Capa que agrupa los marcadores, para poder borrarlos todos juntos.
  const capaMarcadores = L.layerGroup().addTo(mapa);
  // Marcador de cada punto según su id, para poder abrir su popup.
  const marcadores = new Map();

  mapa.on("click", (evento) => {
    // El mapa se repite hacia los costados y ahí la longitud pasa de 180.
    // wrap() la devuelve al rango -180 a 180.
    const { lat, lng } = evento.latlng.wrap();
    alHacerClic({ latitud: lat, longitud: lng });
  });

  /** Reemplaza los marcadores por los de la lista recibida. */
  function mostrarPuntos(puntos) {
    capaMarcadores.clearLayers();
    marcadores.clear();
    for (const punto of puntos) {
      const marcador = crearMarcador(punto).addTo(capaMarcadores);
      marcadores.set(punto.id, marcador);
    }
  }

  /**
   * Mueve el mapa para que las coordenadas queden a la vista.
   * zonaTapada indica cuántos píxeles del mapa cubre el panel del listado
   * ({ derecha, abajo }): esa parte se descuenta para que nada quede detrás.
   */
  function ajustarVista(coordenadas, zoomMaximo, zonaTapada) {
    const [margenX, margenY] = MAPA.margenAlEncuadrar;
    mapa.fitBounds(coordenadas, {
      maxZoom: zoomMaximo,
      paddingTopLeft: [margenX, margenY],
      paddingBottomRight: [
        margenX + zonaTapada.derecha,
        margenY + zonaTapada.abajo,
      ],
    });
  }

  /** Mueve el mapa para que se vean todos los puntos. */
  function encuadrar(puntos, zonaTapada) {
    if (puntos.length === 0) return;
    const coordenadas = puntos.map((punto) => [punto.latitud, punto.longitud]);
    ajustarVista(coordenadas, MAPA.zoomMaximoAlEncuadrar, zonaTapada);
  }

  /** Lleva el mapa hasta un punto y abre su popup. */
  function enfocar(punto, zonaTapada) {
    ajustarVista(
      [[punto.latitud, punto.longitud]],
      MAPA.zoomAlEnfocar,
      zonaTapada
    );
    marcadores.get(punto.id)?.openPopup();
  }

  return { mostrarPuntos, encuadrar, enfocar };
}

/** Suma la capa de señales náuticas y un control para mostrarla u ocultarla. */
function agregarSenalesNauticas(mapa) {
  const { nombre, urlTeselas, atribucion } = MAPA.senalesNauticas;
  const capa = L.tileLayer(urlTeselas, {
    attribution: atribucion,
    referrerPolicy: MAPA.politicaDeReferencia,
  }).addTo(mapa);
  // L.control.layers arma la casilla para prender y apagar la capa.
  L.control.layers(null, { [nombre]: capa }, { position: "topleft" }).addTo(mapa);
}

/** Muestra en una esquina la latitud y la longitud bajo el cursor. */
function agregarCoordenadasDelCursor(mapa) {
  const control = L.control({ position: "bottomleft" });
  let caja;
  control.onAdd = () => {
    caja = L.DomUtil.create("div", "coordenadas-cursor");
    return caja;
  };
  control.addTo(mapa);

  mapa.on("mousemove", (evento) => {
    const { lat, lng } = evento.latlng.wrap();
    caja.textContent = [lat, lng]
      .map((valor) => valor.toFixed(DECIMALES_COORDENADA))
      .join(", ");
  });
  mapa.on("mouseout", () => {
    caja.textContent = "";
  });
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
