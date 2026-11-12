from django.urls import path

from . import views

urlpatterns = [
    path("api/puntos/", views.PuntosView.as_view(), name="api_puntos"),
]
