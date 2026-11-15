from django import forms

from .models import Punto


class PuntoForm(forms.ModelForm):
    """Valida los datos de un punto.

    Un ModelForm se arma a partir del modelo: toma de ahí los campos y sus
    reglas (obligatorios, rangos, opciones), así que la validación no se
    escribe dos veces.

    El mismo formulario dibuja los campos en la página (ver inicio.html), con
    los atributos HTML que salen de esas reglas: required, maxlength, opciones.
    """

    FILAS_DESCRIPCION = 3

    class Meta:
        model = Punto
        fields = ["nombre", "descripcion", "latitud", "longitud", "estado"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["descripcion"].widget.attrs["rows"] = self.FILAS_DESCRIPCION
