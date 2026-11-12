from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import Punto


def punto_valido(**cambios):
    """Arma un Punto correcto (sin guardarlo); cada test cambia solo lo que prueba."""
    datos = {
        "nombre": "Obelisco",
        "descripcion": "Monumento histórico de Buenos Aires",
        "latitud": Decimal("-34.603722"),
        "longitud": Decimal("-58.381592"),
    }
    datos.update(cambios)
    return Punto(**datos)


class PuntoModelTests(TestCase):
    # full_clean() ejecuta todas las validaciones del modelo y lanza
    # ValidationError si alguna falla. Es lo mismo que usan los formularios.

    def test_punto_valido_pasa_la_validacion(self):
        punto_valido().full_clean()

    def test_estado_por_defecto_es_activo(self):
        self.assertEqual(punto_valido().estado, Punto.Estado.ACTIVO)

    def test_se_muestra_por_su_nombre(self):
        self.assertEqual(str(punto_valido()), "Obelisco")

    def test_la_descripcion_es_opcional(self):
        punto_valido(descripcion="").full_clean()

    def test_el_nombre_es_obligatorio(self):
        with self.assertRaises(ValidationError) as error:
            punto_valido(nombre="").full_clean()
        self.assertIn("nombre", error.exception.message_dict)

    def test_rechaza_un_estado_desconocido(self):
        with self.assertRaises(ValidationError) as error:
            punto_valido(estado="borrado").full_clean()
        self.assertIn("estado", error.exception.message_dict)

    def test_acepta_latitud_en_los_bordes(self):
        for latitud in ("90", "-90"):
            with self.subTest(latitud=latitud):
                punto_valido(latitud=Decimal(latitud)).full_clean()

    def test_rechaza_latitud_fuera_de_rango(self):
        for latitud in ("90.000001", "-90.000001", "200"):
            with self.subTest(latitud=latitud):
                with self.assertRaises(ValidationError) as error:
                    punto_valido(latitud=Decimal(latitud)).full_clean()
                self.assertIn("latitud", error.exception.message_dict)

    def test_acepta_longitud_en_los_bordes(self):
        for longitud in ("180", "-180"):
            with self.subTest(longitud=longitud):
                punto_valido(longitud=Decimal(longitud)).full_clean()

    def test_rechaza_longitud_fuera_de_rango(self):
        for longitud in ("180.000001", "-180.000001", "500"):
            with self.subTest(longitud=longitud):
                with self.assertRaises(ValidationError) as error:
                    punto_valido(longitud=Decimal(longitud)).full_clean()
                self.assertIn("longitud", error.exception.message_dict)
