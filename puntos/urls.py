from django.urls import path

from . import views

urlpatterns = [
    path("", views.inicio, name="inicio"),
    path("api/puntos/", views.PuntosView.as_view(), name="api_puntos"),
    path(
        "api/puntos/<int:punto_id>/",
        views.PuntoDetalleView.as_view(),
        name="api_punto_detalle",
    ),
]
