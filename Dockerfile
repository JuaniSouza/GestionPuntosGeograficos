# Receta para armar la imagen de la aplicación.

# Imagen base oficial con Python ya instalado. "slim" es la variante liviana.
FROM python:3.13-slim

# No generar archivos .pyc y mostrar los mensajes de Python al instante
# (sin esto, los logs del contenedor aparecen con demora).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Carpeta de trabajo dentro del contenedor.
WORKDIR /app

# Primero solo las dependencias: Docker guarda cada paso en caché, así que
# mientras requirements.txt no cambie, no vuelve a instalar Django aunque
# cambie el código.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Después el código (lo que lista .dockerignore no se copia).
COPY . .

# Puerto en el que escucha la aplicación.
EXPOSE 8000

# Al iniciar el contenedor:
#   1. migrate crea o actualiza las tablas.
#   2. cargar_ejemplos carga los datos de ejemplo si la base está vacía.
#   3. Muestra la dirección para abrir en el navegador.
#   4. runserver levanta el servidor. 0.0.0.0 hace que acepte conexiones de
#      fuera del contenedor; con el valor por defecto (127.0.0.1) solo se
#      podría entrar desde adentro. Esa dirección sirve para escuchar, no
#      para entrar: en el navegador se usa localhost.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py cargar_ejemplos && echo '>>> Aplicación lista. Abrir en el navegador: http://localhost:8000' && python manage.py runserver 0.0.0.0:8000"]
