// El formulario de un punto, dentro de una ventana modal (<dialog>).
// Los campos ya vienen dibujados en la página por Django (ver inicio.html).

import { DECIMALES_COORDENADA } from "./config.js";

const TITULOS = { crear: "Nuevo punto", editar: "Editar punto" };
const MENSAJE_ERROR =
  "No se pudo guardar el punto. Revisá los datos e intentá de nuevo.";

/**
 * Prepara el formulario y devuelve sus operaciones.
 * alGuardar recibe los datos cargados y el punto que se está editando (null
 * si es uno nuevo). Devuelve una promesa: si falla, el formulario queda
 * abierto y muestra el error.
 */
export function crearFormulario({ alGuardar }) {
  const dialogo = document.getElementById("dialogo-punto");
  const formulario = document.getElementById("formulario-punto");
  const titulo = document.getElementById("dialogo-titulo");
  const error = document.getElementById("formulario-error");
  const botonGuardar = document.getElementById("formulario-guardar");
  const botonCancelar = document.getElementById("formulario-cancelar");

  // El punto que se está editando, o null cuando se crea uno nuevo.
  let puntoEnEdicion = null;

  /** Abre el formulario vacío, con las coordenadas ya cargadas. */
  function abrirParaCrear({ latitud, longitud }) {
    abrir(TITULOS.crear, null, {
      // El backend acepta hasta DECIMALES_COORDENADA decimales y un clic en
      // el mapa trae muchos más: se redondea antes de mostrarlo.
      latitud: latitud.toFixed(DECIMALES_COORDENADA),
      longitud: longitud.toFixed(DECIMALES_COORDENADA),
    });
  }

  /** Abre el formulario con los datos actuales del punto. */
  function abrirParaEditar(punto) {
    // Se separa el id: no es un campo del formulario, viaja en la URL.
    const { id, ...valores } = punto;
    abrir(TITULOS.editar, punto, valores);
  }

  function abrir(textoTitulo, punto, valores) {
    titulo.textContent = textoTitulo;
    puntoEnEdicion = punto;
    formulario.reset();
    for (const [campo, valor] of Object.entries(valores)) {
      formulario.elements[campo].value = valor;
    }
    error.hidden = true;
    dialogo.showModal();
  }

  botonCancelar.addEventListener("click", () => dialogo.close());

  formulario.addEventListener("submit", async (evento) => {
    // Se evita el envío clásico (que recarga la página) y se usa la API.
    evento.preventDefault();
    // FormData junta los valores de los campos por su atributo name.
    const datos = Object.fromEntries(new FormData(formulario));

    botonGuardar.disabled = true;
    try {
      await alGuardar(datos, puntoEnEdicion);
      dialogo.close();
    } catch (fallo) {
      console.error(fallo);
      error.textContent = MENSAJE_ERROR;
      error.hidden = false;
    } finally {
      botonGuardar.disabled = false;
    }
  });

  return { abrirParaCrear, abrirParaEditar };
}
