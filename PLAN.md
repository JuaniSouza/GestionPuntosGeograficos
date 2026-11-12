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

## Etapa 1 — Base del proyecto

- [ ] **1. Esqueleto Django.** `requirements.txt`, `.gitignore`, proyecto
  `config`, app `puntos`, idioma y zona horaria, base en `data/db.sqlite3`.
  *Listo cuando:* `python manage.py check` pasa y el servidor levanta.
- [ ] **2. Modelo `Punto`.** Nombre, descripción, latitud, longitud, estado
  (Activo / Inactivo), con validadores de rango, migración y registro en el admin.
  *Listo cuando:* la migración aplica y se puede crear un punto desde el admin.
- [ ] **3. Tests del modelo.** Coordenadas válidas, fuera de rango y en los bordes.
  *Listo cuando:* `python manage.py test` pasa.

## Etapa 2 — API (backend)

- [ ] **4. Listar puntos.** `GET /api/puntos/` devuelve JSON.
- [ ] **5. Crear punto.** `POST /api/puntos/`, con errores de validación en JSON
  y código 400.
- [ ] **6. Editar y eliminar.** `PUT` y `DELETE` en `/api/puntos/<id>/`, con 404
  si no existe.
- [ ] **7. Tests de la API.** Casos felices y de error de los cuatro verbos.
  *Listo cuando (4 a 7):* los tests pasan y se probó a mano con `curl`.

## Etapa 3 — Frontend

- [ ] **8. Página base.** Template, CSS y estructura mapa + tabla (vacíos).
- [ ] **9. Mapa con puntos.** Leaflet carga los puntos desde la API. Al
  seleccionar un marcador muestra nombre y descripción. Inactivos en gris.
- [ ] **10. Tabla.** Nombre, estado, coordenadas y acciones.
- [ ] **11. Crear desde el mapa.** Click en el mapa abre el formulario con las
  coordenadas precargadas.
- [ ] **12. Editar.** Desde la tabla, con el mismo formulario.
- [ ] **13. Eliminar.** Con confirmación.
- [ ] **14. Validación y errores en pantalla.** Validación en el navegador y
  mensajes de error del backend junto a cada campo.
  *Listo cuando (8 a 14):* se probó cada flujo en el navegador.

## Etapa 4 — Datos y Docker

- [ ] **15. Datos de ejemplo.** Fixture y carga automática que no duplica.
- [ ] **16. Dockerfile.**
- [ ] **17. docker-compose.yml.** Volumen para SQLite y arranque que migra y
  carga los datos solo.
  *Listo cuando:* `docker compose up --build` levanta todo sin pasos manuales.
- [ ] **18. Prueba de persistencia.** Crear un punto, `docker compose down`,
  `up`, y el punto sigue ahí.

## Etapa 5 — Entrega

- [ ] **19. README.** Instrucciones de ejecución, estructura, decisiones técnicas
  y endpoints.
- [ ] **20. Repaso final.** Revisión completa del código y guion para la defensa.

## Skills del proyecto

| Skill | Se usa | Dónde |
|---|---|---|
| `api-design-principles` | Sí | Pasos 4 a 7: URLs, verbos y códigos HTTP. |
| `error-handling-patterns` | Sí | Pasos 5, 6 y 14: formato y manejo de errores. |
| `prompt-engineering-patterns` | No | La aplicación no usa modelos de lenguaje. |
