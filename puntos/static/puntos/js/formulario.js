// El formulario de un punto, dentro de una ventana modal (<dialog>).
// Los campos ya vienen dibujados en la página por Django (ver inicio.html).

import { ErrorDeApi } from "./api.js";
import { DECIMALES_COORDENADA } from "./config.js";
import { mensajeDeValidacion } from "./validacion.js";

const TITULOS = { crear: "Nuevo punto", editar: "Editar punto" };
const MENSAJE_SIN_CONEXION =
  "No se pudo guardar el punto. Revisá la conexión e intentá de nuevo.";

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
  const errorGeneral = document.getElementById("formulario-error");
  const botonGuardar = document.getElementById("formulario-guardar");
  const botonCancelar = document.getElementById("formulario-cancelar");
  // Los controles con name son los campos; los botones no tienen.
  const campos = [...formulario.elements].filter((elemento) => elemento.name);

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
    limpiarErrores();
    dialogo.showModal();
  }

  // --- Errores ---

  /** Muestra (o borra, si el mensaje está vacío) el error de un campo. */
  function mostrarErrorDeCampo(campo, mensaje) {
    const lugar = document.getElementById(`error-${campo.name}`);
    lugar.textContent = mensaje;
    lugar.hidden = !mensaje;
    // Estos atributos avisan a los lectores de pantalla que el campo tiene
    // un error y dónde está el mensaje. El CSS usa aria-invalid para el color.
    campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
    campo.setAttribute("aria-describedby", lugar.id);
  }

  function mostrarErrorGeneral(mensaje) {
    errorGeneral.textContent = mensaje;
    errorGeneral.hidden = !mensaje;
  }

  function limpiarErrores() {
    campos.forEach((campo) => mostrarErrorDeCampo(campo, ""));
    mostrarErrorGeneral("");
  }

  /**
   * Muestra los errores con la forma { campo: [mensajes] }, que es la que
   * devuelve la API. Los que no son de un campo del formulario (por ejemplo
   * "general") van al aviso de arriba.
   */
  function mostrarErrores(errores) {
    const generales = [];
    for (const [nombre, mensajes] of Object.entries(errores)) {
      const campo = formulario.elements[nombre];
      if (campo) {
        mostrarErrorDeCampo(campo, mensajes.join(" "));
      } else {
        generales.push(...mensajes);
      }
    }
    mostrarErrorGeneral(generales.join(" "));
    // El cursor va al primer campo con error.
    campos.find((campo) => campo.getAttribute("aria-invalid") === "true")?.focus();
  }

  /** Valida en el navegador. Devuelve los errores con la forma de la API. */
  function validar() {
    const errores = {};
    for (const campo of campos) {
      const mensaje = mensajeDeValidacion(campo);
      if (mensaje) errores[campo.name] = [mensaje];
    }
    return errores;
  }

  // --- Eventos ---

  botonCancelar.addEventListener("click", () => dialogo.close());

  // Al corregir un campo se borra su error.
  formulario.addEventListener("input", (evento) => {
    if (evento.target.name) mostrarErrorDeCampo(evento.target, "");
  });

  formulario.addEventListener("submit", async (evento) => {
    // Se evita el envío clásico (que recarga la página) y se usa la API.
    evento.preventDefault();
    limpiarErrores();

    const erroresDelNavegador = validar();
    if (Object.keys(erroresDelNavegador).length > 0) {
      mostrarErrores(erroresDelNavegador);
      return;
    }

    // FormData junta los valores de los campos por su atributo name.
    const datos = Object.fromEntries(new FormData(formulario));
    botonGuardar.disabled = true;
    try {
      await alGuardar(datos, puntoEnEdicion);
      dialogo.close();
    } catch (fallo) {
      console.error(fallo);
      // Si el backend rechazó los datos, trae el detalle por campo.
      const errores = fallo instanceof ErrorDeApi ? fallo.errores : {};
      if (Object.keys(errores).length > 0) {
        mostrarErrores(errores);
      } else {
        mostrarErrorGeneral(MENSAJE_SIN_CONEXION);
      }
    } finally {
      botonGuardar.disabled = false;
    }
  });

  return { abrirParaCrear, abrirParaEditar };
}
