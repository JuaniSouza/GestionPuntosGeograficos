# Gestión de puntos geográficos

Ejercicio técnico. Las instrucciones de ejecución y el detalle de las
decisiones se completan al cerrar el proyecto (ver `PLAN.md`).

## Notas técnicas

### El mapa depende de un servicio externo (OpenStreetMap)

Leaflet dibuja el mapa, pero las imágenes del fondo ("teselas") se descargan
de los servidores de OpenStreetMap. Hace falta conexión a internet para verlas.

OpenStreetMap exige que cada pedido informe desde qué sitio viene (cabecera
`Referer`); si no, responde una imagen de "403 Access blocked". Django envía
por defecto `Referrer-Policy: same-origin`, que le indica al navegador no
informar el sitio a terceros, y por eso el mapa aparecía bloqueado.

Solución: la capa de teselas se crea con
`referrerPolicy: "strict-origin-when-cross-origin"` (ver `MAPA` en
`puntos/static/puntos/js/config.js`). Solo las imágenes del mapa informan el
origen de la página (por ejemplo `http://localhost:8000/`, sin la ruta) y el
resto del sitio conserva la política de Django.

### Servidor dentro del contenedor: desarrollo vs. producción

El contenedor arranca con `python manage.py runserver`, el servidor de
desarrollo de Django. Se eligió porque el ejercicio corre en una máquina
local, con un solo usuario, y no suma dependencias ni configuración.

No es adecuado para producción: la documentación de Django lo indica
expresamente, porque no está pensado para carga real ni auditado en
seguridad. Para un despliegue real cambiaría lo siguiente:

| | Este ejercicio | Producción |
|---|---|---|
| Servidor | `runserver` | Gunicorn (servidor WSGI con varios procesos) |
| Archivos estáticos (CSS, JS) | Los sirve `runserver` | `collectstatic` + WhiteNoise o un Nginx delante |
| `DEBUG` | `true` | `false`, para no mostrar detalles internos en los errores |
| `SECRET_KEY` | Valor de desarrollo | Valor secreto, fuera del repositorio |
| Base de datos | SQLite en un volumen | PostgreSQL en su propio contenedor |

El cambio está preparado: `SECRET_KEY`, `DEBUG` y `ALLOWED_HOSTS` se leen de
variables de entorno (`DJANGO_SECRET_KEY`, `DJANGO_DEBUG`,
`DJANGO_ALLOWED_HOSTS`), así que se configuran sin tocar el código.
