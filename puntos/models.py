from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Punto(models.Model):
    """Un punto geográfico que se muestra en el mapa."""

    class Estado(models.TextChoices):
        # (valor que se guarda en la base, texto que ve el usuario)
        ACTIVO = "activo", "Activo"
        INACTIVO = "inactivo", "Inactivo"

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField("descripción", blank=True)
    # DecimalField guarda el número exacto (un float puede arrastrar errores de
    # redondeo). Seis decimales equivalen a unos 11 cm de precisión.
    latitud = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )
    longitud = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )
    estado = models.CharField(
        max_length=10, choices=Estado.choices, default=Estado.ACTIVO
    )

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre
