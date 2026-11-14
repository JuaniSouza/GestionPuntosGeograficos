# Plan de trabajo

Lista de pasos del ejercicio. Cada paso es un commit + push chico, que se puede
revertir por separado. Se marca `[x]` al terminar y verificar cada uno.

**Regla de cada paso:** hacer → verificar (lo indicado en "Listo cuando") →
commit → push → marcar acá.

## Decisiones generales

- Django con templates + JavaScript vanilla + Leaflet. Sin frameworks de frontend
  ni Django REST Framework: la consigna pide vistas y URLs de Django.
- Una sola pantalla: mapa y tabla juntos. El CRUD se hace con `fetch` contra una
  API JSON propia, sin recargar la página.
- La validación vive en el backend (modelo + `ModelForm`). El frontend valida
  además, solo para dar respuesta rápida al usuario.
- SQLite en una carpeta `data/`, que en Docker es un volumen.

## Criterios de código

Se revisan al cerrar cada paso.

- **Una sola fuente de verdad.** Cada regla se escribe una vez. Los límites de
  las coordenadas están como constantes en `puntos/models.py`; el formulario, la
  API y la pantalla los toman de ahí.
- **Sin validación duplicada.** Valida el modelo. El `ModelForm` reutiliza esas
  reglas y el navegador recibe los límites desde el backend.
- **Sin números ni textos sueltos.** Constantes con nombre y `HTTPStatus` para
  los códigos de respuesta.
- **Cada archivo con una responsabilidad.** `models.py` datos y reglas,
  `forms.py` validación de entrada, `views.py` pedidos y respuestas, `urls.py`
  rutas.
- **Sin código repetido.** Lo que se usa dos veces va a una función.
- **Sin funcionalidad que nadie pidió.** Nada de paginación, versionado ni
  autenticación: la consigna no los pide y se anotan en el README como mejoras.

## Etapa 1 — Base del proyecto

- [x] **1. Esqueleto Django.** `requirements.txt`, `.gitignore`, proyecto
  `config`, app `puntos`, idioma y zona horaria, base en `data/db.sqlite3`.
  *Listo cuando:* `python manage.py check` pasa y el servidor levanta.
- [x] **2. Modelo `Punto`.** Nombre, descripción, latitud, longitud, estado
  (Activo / Inactivo), con validadores de rango, migración y registro en el admin.
  Tests primero: coordenadas válidas, fuera de rango y en los bordes.
  *Listo cuando:* los tests pasan y se puede crear un punto desde el admin.

## Etapa 2 — API (backend)

Cada paso arranca por sus tests (caso feliz y casos de error).

- [x] **3. Listar puntos.** `GET /api/puntos/` devuelve JSON.
- [x] **4. Crear punto.** `POST /api/puntos/`, con errores de validación en JSON
  y código 400.
- [x] **5. Editar punto.** `PUT /api/puntos/<id>/`, con 404 si no existe.
- [x] **6. Eliminar punto.** `DELETE /api/puntos/<id>/`, con 404 si no existe.
  *Listo cuando (3 a 6):* los tests pasan y se probó a mano con `curl`.

## Etapa 3 — Frontend

- [x] **7. Página base.** Template, CSS y estructura mapa + tabla (vacíos).
- [ ] **8. Mapa con puntos.** Leaflet carga los puntos desde la API. Al
  seleccionar un marcador muestra nombre y descripción. Inactivos en gris.
- [ ] **9. Tabla.** Nombre, estado, coordenadas y acciones.
- [ ] **10. Crear desde el mapa.** Click en el mapa abre el formulario con las
  coordenadas precargadas.
- [ ] **11. Editar.** Desde la tabla, con el mismo formulario.
- [ ] **12. Eliminar.** Con confirmación.
- [ ] **13. Validación y errores en pantalla.** Validación en el navegador y
  mensajes de error del backend junto a cada campo.
  *Listo cuando (7 a 13):* se probó cada flujo en el navegador.

## Etapa 4 — Datos y Docker

- [ ] **14. Datos de ejemplo.** Fixture y carga automática que no duplica.
- [ ] **15. Dockerfile.**
- [ ] **16. docker-compose.yml.** Volumen para SQLite y arranque que migra y
  carga los datos solo.
  *Listo cuando:* `docker compose up --build` levanta todo sin pasos manuales.
- [ ] **17. Prueba de persistencia.** Crear un punto, `docker compose down`,
  `up`, y el punto sigue ahí.

## Etapa 5 — Entrega

- [ ] **18. README.** Instrucciones de ejecución, estructura, decisiones técnicas
  y endpoints.
- [ ] **19. Repaso final.** Revisión completa del código y guion para la defensa.

## Skills

Antes de cada paso se revisa esta tabla y se carga la skill que corresponda.

| Skill | Dónde se usa |
|---|---|
| `superpowers:test-driven-development` | Pasos 2 a 6: el test se escribe antes que el código. |
| `api-design-principles` | Pasos 3 a 6: URLs, verbos y códigos HTTP. |
| `error-handling-patterns` | Pasos 4 a 6 y 13: formato y manejo de errores. |
| `frontend-design:frontend-design` | Pasos 7 a 13: diseño de la pantalla, mapa, tabla y formulario. |
| `superpowers:systematic-debugging` | Cuando aparezca un bug o un test falle sin causa clara. |
| `superpowers:verification-before-completion` | Al cerrar cada paso, antes de marcarlo `[x]` y commitear. |
| `superpowers:requesting-code-review` | Paso 19: repaso final del código. |

No se usan: `prompt-engineering-patterns` (la aplicación no usa modelos de
lenguaje) y las skills de Superpowers de subagentes y worktrees (el trabajo es
secuencial y en una sola rama).
