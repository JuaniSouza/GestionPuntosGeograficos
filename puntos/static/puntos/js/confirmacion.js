// Ventana que pide confirmar una acción que no se puede deshacer.

const VALOR_CONFIRMAR = "confirmar"; // value del botón en inicio.html

export function crearConfirmacion() {
  const dialogo = document.getElementById("dialogo-eliminar");
  const mensaje = document.getElementById("eliminar-mensaje");

  /**
   * Muestra el mensaje y espera la decisión.
   * Devuelve una promesa con true si se confirmó y false si se canceló
   * (con el botón Cancelar o con la tecla Escape).
   */
  function pedir(texto) {
    mensaje.textContent = texto;
    // returnValue guarda el value del botón que cerró la ventana. Se limpia
    // para que no quede el de la vez anterior si ahora se cierra con Escape.
    dialogo.returnValue = "";
    dialogo.showModal();
    return new Promise((resolver) => {
      dialogo.addEventListener(
        "close",
        () => resolver(dialogo.returnValue === VALOR_CONFIRMAR),
        { once: true }
      );
    });
  }

  return { pedir };
}
