from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import Punto


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


@require_http_methods(["GET"])
def api_puntos(request):
    """GET /api/puntos/ — lista todos los puntos."""
    puntos = [punto_a_dict(punto) for punto in Punto.objects.all()]
    return JsonResponse({"puntos": puntos})
