// Buscador por nombre y filtro por estado. Trabajan sobre los puntos ya
// cargados en el navegador, sin pedirle nada al backend.

/**
 * Prepara los filtros y devuelve sus operaciones.
 * alCambiar se llama cada vez que el usuario modifica un filtro.
 */
export function crearFiltros({ alCambiar }) {
  const buscador = document.getElementById("buscador");
  const filtroEstado = document.getElementById("filtro-estado");

  buscador.addEventListener("input", alCambiar);
  filtroEstado.addEventListener("change", alCambiar);

  /** Devuelve los puntos que coinciden con el nombre y el estado elegidos. */
  function aplicar(puntos) {
    const buscado = normalizar(buscador.value.trim());
    // La opción "Todos los estados" tiene valor vacío.
    const estado = filtroEstado.value;
    return puntos.filter(
      (punto) =>
        normalizar(punto.nombre).includes(buscado) &&
        (estado === "" || punto.estado === estado)
    );
  }

  return { aplicar };
}

/** Pasa a minúsculas y quita los acentos, para que "bahia" encuentre "Bahía". */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
