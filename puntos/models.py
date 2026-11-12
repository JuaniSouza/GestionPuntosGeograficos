from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

# Límites de las coordenadas. Se definen una sola vez acá y el resto del
# proyecto (formularios, API, pantalla) los toma de este lugar.
LATITUD_MIN, LATITUD_MAX = -90, 90
LONGITUD_MIN, LONGITUD_MAX = -180, 180
# Seis decimales equivalen a unos 11 cm de precisión sobre el terreno.
COORDENADA_DECIMALES = 6
# Hasta tres cifras enteras (180) más los decimales.
COORDENADA_DIGITOS = 3 + COORDENADA_DECIMALES


class Punto(models.Model):
    """Un punto geográfico que se muestra en el mapa."""

    class Estado(models.TextChoices):
        # (valor que se guarda en la base, texto que ve el usuario)
        ACTIVO = "activo", "Activo"
        INACTIVO = "inactivo", "Inactivo"

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField("descripción", blank=True)
    # DecimalField guarda el número exacto (un float puede arrastrar errores de
    # redondeo).
    latitud = models.DecimalField(
        max_digits=COORDENADA_DIGITOS,
        decimal_places=COORDENADA_DECIMALES,
        validators=[
            MinValueValidator(LATITUD_MIN),
            MaxValueValidator(LATITUD_MAX),
        ],
    )
    longitud = models.DecimalField(
        max_digits=COORDENADA_DIGITOS,
        decimal_places=COORDENADA_DECIMALES,
        validators=[
            MinValueValidator(LONGITUD_MIN),
            MaxValueValidator(LONGITUD_MAX),
        ],
    )
    estado = models.CharField(
        max_length=10, choices=Estado.choices, default=Estado.ACTIVO
    )

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre
