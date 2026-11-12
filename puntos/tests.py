from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import Client, TestCase

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


class ListarPuntosApiTests(TestCase):
    # self.client simula un navegador: hace pedidos a las URLs sin levantar
    # un servidor. Cada test usa una base de datos de prueba vacía.

    def test_sin_puntos_devuelve_una_lista_vacia(self):
        respuesta = self.client.get("/api/puntos/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json(), {"puntos": []})

    def test_devuelve_los_datos_de_cada_punto(self):
        punto = punto_valido(estado=Punto.Estado.INACTIVO)
        punto.save()

        respuesta = self.client.get("/api/puntos/")

        self.assertEqual(
            respuesta.json(),
            {
                "puntos": [
                    {
                        "id": punto.id,
                        "nombre": "Obelisco",
                        "descripcion": "Monumento histórico de Buenos Aires",
                        "latitud": -34.603722,
                        "longitud": -58.381592,
                        "estado": "inactivo",
                    }
                ]
            },
        )

    def test_los_puntos_vienen_ordenados_por_nombre(self):
        punto_valido(nombre="Zoológico").save()
        punto_valido(nombre="Aeroparque").save()

        respuesta = self.client.get("/api/puntos/")

        nombres = [punto["nombre"] for punto in respuesta.json()["puntos"]]
        self.assertEqual(nombres, ["Aeroparque", "Zoológico"])

    def test_rechaza_verbos_no_soportados(self):
        respuesta = self.client.delete("/api/puntos/")

        self.assertEqual(respuesta.status_code, 405)


class CrearPuntoApiTests(TestCase):
    DATOS = {
        "nombre": "Obelisco",
        "descripcion": "Monumento histórico de Buenos Aires",
        "latitud": -34.603722,
        "longitud": -58.381592,
        "estado": "activo",
    }

    def crear(self, datos):
        return self.client.post(
            "/api/puntos/", data=datos, content_type="application/json"
        )

    def test_crea_el_punto_y_lo_devuelve(self):
        respuesta = self.crear(self.DATOS)

        self.assertEqual(respuesta.status_code, 201)
        punto = Punto.objects.get()
        self.assertEqual(punto.nombre, "Obelisco")
        self.assertEqual(punto.latitud, Decimal("-34.603722"))
        self.assertEqual(respuesta.json(), {"punto": {"id": punto.id, **self.DATOS}})

    def test_coordenada_fuera_de_rango_devuelve_el_error_del_campo(self):
        respuesta = self.crear({**self.DATOS, "latitud": 200})

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(list(respuesta.json()["errores"]), ["latitud"])
        self.assertEqual(Punto.objects.count(), 0)

    def test_informa_todos_los_campos_con_error(self):
        respuesta = self.crear({"descripcion": "Sin nada más"})

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(
            sorted(respuesta.json()["errores"]),
            ["estado", "latitud", "longitud", "nombre"],
        )

    def test_json_mal_formado_devuelve_error_general(self):
        respuesta = self.crear("{esto no es json")

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(list(respuesta.json()["errores"]), ["general"])

    def test_json_que_no_es_un_objeto_devuelve_error_general(self):
        respuesta = self.crear([1, 2, 3])

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(list(respuesta.json()["errores"]), ["general"])

    def test_sin_token_csrf_se_rechaza(self):
        cliente = Client(enforce_csrf_checks=True)

        respuesta = cliente.post(
            "/api/puntos/", data=self.DATOS, content_type="application/json"
        )

        self.assertEqual(respuesta.status_code, 403)
        self.assertEqual(Punto.objects.count(), 0)
