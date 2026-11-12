import json
from http import HTTPStatus

from django.http import JsonResponse
from django.views import View

from .forms import PuntoForm
from .models import Punto

# Clave que agrupa los errores que no pertenecen a un campo en particular.
ERROR_GENERAL = "general"


class CuerpoInvalido(Exception):
    """El cuerpo del pedido no es un objeto JSON."""


def punto_a_dict(punto):
    """Convierte un Punto en un diccionario que se puede enviar como JSON."""
    return {
        "id": punto.id,
        "nombre": punto.nombre,
        "descripcion": punto.descripcion,
        # JSON no tiene tipo decimal: se envían como número para que Leaflet
        # pueda usarlos directamente.
        "latitud": float(punto.latitud),
        "longitud": float(punto.longitud),
        "estado": punto.estado,
    }


def leer_json(request):
    """Devuelve el cuerpo del pedido como diccionario o lanza CuerpoInvalido."""
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError as error:
        raise CuerpoInvalido("El cuerpo del pedido no es JSON válido.") from error
    if not isinstance(datos, dict):
        raise CuerpoInvalido("El cuerpo del pedido debe ser un objeto JSON.")
    return datos


def respuesta_errores(errores):
    """Respuesta 400 con el formato único de errores: {"errores": {campo: [mensajes]}}."""
    return JsonResponse({"errores": errores}, status=HTTPStatus.BAD_REQUEST)


class PuntosView(View):
    """/api/puntos/ — la colección de puntos.

    View llama al método que se llama igual que el verbo HTTP del pedido y
    responde 405 a los verbos que no están definidos.
    """

    def get(self, request):
        puntos = [punto_a_dict(punto) for punto in Punto.objects.all()]
        return JsonResponse({"puntos": puntos})

    def post(self, request):
        try:
            datos = leer_json(request)
        except CuerpoInvalido as error:
            return respuesta_errores({ERROR_GENERAL: [str(error)]})

        formulario = PuntoForm(datos)
        if not formulario.is_valid():
            return respuesta_errores(formulario.errors)

        punto = formulario.save()
        return JsonResponse({"punto": punto_a_dict(punto)}, status=HTTPStatus.CREATED)
