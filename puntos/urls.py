from django.urls import path

from . import views

urlpatterns = [
    path("api/puntos/", views.api_puntos, name="api_puntos"),
]
