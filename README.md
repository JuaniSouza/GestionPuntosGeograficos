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
