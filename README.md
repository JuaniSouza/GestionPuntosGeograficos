# Gestión de puntos geográficos

Aplicación web para crear, ver, editar y eliminar puntos geográficos sobre un
mapa. Ejercicio técnico Full Stack.

- **Backend:** Python 3.13 + Django 5.2
- **Base de datos:** SQLite
- **Frontend:** HTML, CSS y JavaScript (sin frameworks)
- **Mapa:** Leaflet 1.9.4 con teselas de OpenStreetMap
- **Infraestructura:** Docker + Docker Compose

## Cómo ejecutarlo

Requisito: tener [Docker Desktop](https://www.docker.com/products/docker-desktop/)
instalado y abierto.

```bash
docker compose up --build
```

Cuando la terminal muestre `>>> Aplicación lista`, abrir
**http://localhost:8000** en el navegador.

No hay pasos manuales. Al iniciar, el contenedor:

1. crea las tablas de la base de datos (`migrate`),
2. carga ocho puntos de ejemplo si la base está vacía (`cargar_ejemplos`),
3. levanta el servidor.

> El log de Django también muestra `http://0.0.0.0:8000/`. Esa es la dirección
> en la que el servidor escucha dentro del contenedor; en el navegador se usa
> `localhost`.

### Detener y reiniciar

| Comando | Qué hace | ¿Se conservan los datos? |
|---|---|---|
| `Ctrl + C` | Detiene la aplicación | Sí |
| `docker compose down` | Elimina el contenedor | Sí |
| `docker compose up` | Vuelve a levantar | Sí |
| `docker compose down -v` | Elimina el contenedor y el volumen | No: vuelve a los datos de ejemplo |

### Ejecutar los tests

```bash
docker compose run --rm web python manage.py test
```

Son 42 tests que cubren el modelo, la API, la página y la carga de ejemplos.
Usan una base de datos temporal, no tocan los datos cargados.

## Cómo se usa

- **Ver puntos:** el mapa y la tabla muestran los mismos puntos. Los activos
  se ven en azul y los inactivos en gris.
- **Ver el detalle:** clic en un marcador muestra el nombre y la descripción.
- **Crear:** clic en cualquier lugar del mapa. Se abre el formulario con la
  latitud y la longitud de ese lugar ya cargadas.
- **Editar:** botón *Editar* de la fila. Abre el mismo formulario con los
  datos del punto.
- **Eliminar:** botón *Eliminar* de la fila. Pide confirmación.

Los cambios se reflejan en el mapa y en la tabla sin recargar la página.

## Persistencia

La base es un archivo, `data/db.sqlite3`. En Docker, la carpeta `/app/data`
del contenedor está montada en un volumen con nombre (`datos`), definido en
`docker-compose.yml`. El volumen vive fuera del contenedor, así que los datos
se conservan aunque el contenedor se elimine y se vuelva a crear.

Para comprobarlo: crear un punto, ejecutar `docker compose down` y luego
`docker compose up`. El punto sigue ahí y el log indica
`Ya hay puntos cargados: no se agregan los de ejemplo.`

## Datos de ejemplo

Ocho puertos argentinos (seis activos y dos inactivos), en
`puntos/fixtures/puntos_ejemplo.json`. Las coordenadas son aproximadas y el
estado *inactivo* es ilustrativo.

Los carga el comando `python manage.py cargar_ejemplos`, que se ejecuta en
cada arranque y **solo actúa si no hay ningún punto**. Así no duplica los
ejemplos ni pisa los cambios del usuario.

## API

La página usa una API JSON propia. Todas las respuestas son JSON.

| Método | URL | Acción | Respuesta correcta |
|---|---|---|---|
| `GET` | `/api/puntos/` | Lista los puntos, ordenados por nombre | `200` `{"puntos": [...]}` |
| `POST` | `/api/puntos/` | Crea un punto | `201` `{"punto": {...}}` |
| `PUT` | `/api/puntos/<id>/` | Reemplaza los datos de un punto | `200` `{"punto": {...}}` |
| `DELETE` | `/api/puntos/<id>/` | Elimina un punto | `204` sin contenido |

Un punto tiene esta forma:

```json
{
  "id": 1,
  "nombre": "Puerto de Buenos Aires",
  "descripcion": "Terminales de carga y de cruceros sobre el Río de la Plata.",
  "latitud": -34.5836,
  "longitud": -58.3653,
  "estado": "activo"
}
```

### Errores

Todos los errores tienen el mismo formato: un objeto `errores` cuya clave es
el campo (o `general` si el error no es de un campo) y cuyo valor es una lista
de mensajes.

```json
{ "errores": { "latitud": ["Asegúrese de que este valor es menor o igual a 90."] } }
```

| Código | Cuándo |
|---|---|
| `400` | Datos inválidos o cuerpo que no es JSON |
| `403` | Falta el token CSRF en un pedido que modifica datos |
| `404` | El punto no existe |
| `405` | Método no admitido en esa URL |

### Reglas de validación

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, hasta 100 caracteres |
| `descripcion` | Opcional |
| `latitud` | Obligatoria, entre -90 y 90, hasta 6 decimales |
| `longitud` | Obligatoria, entre -180 y 180, hasta 6 decimales |
| `estado` | `activo` o `inactivo` |

## Estructura del proyecto

```
├── Dockerfile               Receta de la imagen
├── docker-compose.yml       Puerto, variables de entorno y volumen
├── requirements.txt         Dependencias de Python (Django)
├── manage.py                Comandos de Django
├── config/                  Configuración del proyecto (settings, URLs raíz)
├── data/                    Base SQLite (no se versiona; en Docker es el volumen)
└── puntos/                  La aplicación
    ├── models.py            Modelo Punto, constantes y reglas de validación
    ├── forms.py             PuntoForm: valida la entrada y dibuja el formulario
    ├── views.py             Página principal y API JSON
    ├── urls.py              Rutas
    ├── admin.py             Registro del modelo en el admin de Django
    ├── tests.py             Tests
    ├── fixtures/            Datos de ejemplo
    ├── management/commands/ Comando cargar_ejemplos
    ├── migrations/          Cambios de la base de datos
    ├── templates/puntos/    inicio.html, la única página
    └── static/puntos/
        ├── css/estilos.css
        ├── vendor/leaflet/  Leaflet, incluido en el proyecto
        └── js/
            ├── app.js           Punto de entrada: conecta todo
            ├── config.js        Constantes y datos que envía el backend
            ├── api.js           Pedidos al backend (único lugar con fetch)
            ├── mapa.js          Todo lo relacionado con Leaflet
            ├── tabla.js         El listado
            ├── formulario.js    Ventana para crear y editar
            ├── validacion.js    Mensajes de la validación del navegador
            └── confirmacion.js  Ventana para confirmar la eliminación
```

## Decisiones técnicas

### Django con vistas propias, sin Django REST Framework

La consigna pide vistas y URLs de Django. La API son dos vistas basadas en
clases (`PuntosView` y `PuntoDetalleView`) con un método por verbo HTTP;
Django responde `405` solo si el verbo no está definido. Para cuatro endpoints
no se justificaba sumar una dependencia.

### Una sola pantalla

El mapa y la tabla se ven juntos y todas las operaciones se hacen con `fetch`
contra la API, sin recargar. Después de cada cambio se vuelve a pedir la lista
completa: es más simple y la pantalla siempre muestra lo que está guardado.

### Una sola fuente de verdad para las reglas

Los límites de las coordenadas y la cantidad de decimales son constantes en
`puntos/models.py`. De ahí salen:

- la validación del backend (validadores del modelo, que `PuntoForm` reutiliza),
- los atributos `min`, `max`, `step`, `required` y `maxlength` del formulario
  HTML, que genera el mismo `PuntoForm`,
- los nombres de los estados y la precisión que usa el JavaScript, que el
  backend escribe en la página con `json_script`.

El JavaScript no contiene ninguna regla ni ningún límite: `validacion.js` solo
traduce a un mensaje el resultado que calcula el navegador con esos atributos.

### Validación en dos lugares, con roles distintos

- **El backend decide.** Toda escritura pasa por `PuntoForm`. Es la validación
  que cuenta, porque la API se puede usar sin el navegador.
- **El navegador avisa rápido.** Revisa los campos antes de enviar y muestra
  el error junto a cada uno.

Los dos producen errores con el mismo formato (`{campo: [mensajes]}`), así que
el formulario tiene una sola función para mostrarlos.

### Coordenadas como `DecimalField`

Se guardan con 6 decimales (unos 11 cm de precisión) en un `DecimalField` y no
en un `FloatField`, para que el valor guardado sea exactamente el ingresado y
no una aproximación binaria.

### Seguridad

- **CSRF:** la protección de Django queda activa. La página recibe la cookie
  `csrftoken` y el JavaScript la devuelve en la cabecera `X-CSRFToken` en cada
  pedido que modifica datos.
- **XSS:** los textos que carga el usuario se insertan con `textContent`,
  nunca como HTML, así que un nombre con etiquetas se muestra como texto.

### Inactivos visibles

Los puntos inactivos se muestran en el mapa y en la tabla, en gris. La
consigna pide mostrar los puntos y no indica ocultarlos; diferenciarlos por
color conserva la información.

### Leaflet incluido en el proyecto

Leaflet está en `static/puntos/vendor/` en lugar de cargarse desde un CDN. Así
la aplicación no depende de un tercero para funcionar y la versión queda fija.

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

### Volumen con nombre para SQLite

Se usa un volumen administrado por Docker en lugar de enlazar una carpeta del
disco. En Windows, compartir el archivo de SQLite entre el sistema y el
contenedor suele dar problemas de bloqueo y permisos.

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

## Límites conocidos

- **Los datos son locales.** Cada instalación tiene su propia base. Para que
  varios usuarios compartan los puntos habría que desplegar la aplicación en
  un servidor y pasar a una base como PostgreSQL.
- **Si se eliminan todos los puntos, los ejemplos vuelven en el siguiente
  arranque.** El comando solo mira si la tabla está vacía; no distingue
  "primera vez" de "el usuario borró todo".
- **El orden por nombre distingue mayúsculas de minúsculas**, que es el
  comportamiento de SQLite.
- **Sin conexión a internet no se ve el fondo del mapa.** Los marcadores, la
  tabla y el resto de las funciones siguen andando.
- **En pantallas muy angostas la tabla se desplaza hacia el costado.**

## Mejoras posibles

No se incluyeron porque la consigna no las pide:

- Autenticación y permisos por usuario.
- Paginación, búsqueda y filtro por estado en el listado.
- Agrupar marcadores cercanos cuando hay muchos puntos.
- Actualizar en pantalla solo el punto modificado, en lugar de pedir la lista
  completa.
- Tests automáticos del frontend en un navegador.

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `port is already allocated` al levantar | Otro programa usa el puerto 8000 | Detenerlo (`docker ps` y `docker stop <id>`), o cambiar el primer `8000` de `"8000:8000"` en `docker-compose.yml` |
| El navegador dice "ha rechazado la conexión" | La aplicación no está corriendo | Ejecutar `docker compose up` y esperar `>>> Aplicación lista` |
| `http://0.0.0.0:8000` no abre | Esa dirección no sirve en el navegador | Usar `http://localhost:8000` |
| Levanta pero el navegador no conecta | El contenedor quedó sin el puerto publicado | `docker compose down` y `docker compose up` |
| Los cambios en el código no se ven | La imagen no se reconstruyó | `docker compose up --build` |
| `docker: command not found` | Docker Desktop no está instalado o abierto | Instalarlo, abrirlo y reabrir la terminal |

## Desarrollo sin Docker

Para modificar el código es más cómodo correr Django directamente.

```bash
python -m venv .venv
source .venv/Scripts/activate      # Windows con Git Bash
# source .venv/bin/activate        # Linux / macOS
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py cargar_ejemplos
python manage.py runserver
```

Esta forma usa el archivo `data/db.sqlite3` local, distinto del volumen de
Docker. Los tests se corren con `python manage.py test`.

El admin de Django está disponible en `/admin/`; para entrar hay que crear un
usuario con `python manage.py createsuperuser`.

## Uso de herramientas de IA

El proyecto se desarrolló con asistencia de Claude Code, paso a paso y con un
commit por paso. El plan de trabajo que se siguió está en `PLAN.md`.
