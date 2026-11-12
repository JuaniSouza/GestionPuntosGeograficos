from django import forms

from .models import Punto


class PuntoForm(forms.ModelForm):
    """Valida los datos de un punto.

    Un ModelForm se arma a partir del modelo: toma de ahí los campos y sus
    reglas (obligatorios, rangos, opciones), así que la validación no se
    escribe dos veces.
    """

    class Meta:
        model = Punto
        fields = ["nombre", "descripcion", "latitud", "longitud", "estado"]
