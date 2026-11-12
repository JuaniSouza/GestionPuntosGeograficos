from django.contrib import admin

from .models import Punto


@admin.register(Punto)
class PuntoAdmin(admin.ModelAdmin):
    list_display = ["nombre", "estado", "latitud", "longitud"]
    list_filter = ["estado"]
    search_fields = ["nombre"]
