from django.core.management import call_command
from django.core.management.base import BaseCommand

from puntos.models import Punto

# Django busca este archivo en la carpeta fixtures/ de cada app.
FIXTURE = "puntos_ejemplo"


class Command(BaseCommand):
    """Se ejecuta con: python manage.py cargar_ejemplos

    Django convierte en comando cada archivo de management/commands/ que
    tenga una clase Command; el nombre del comando es el del archivo.
    """

    help = "Carga los puntos de ejemplo, solo si todavía no hay ningún punto."

    def handle(self, *args, **options):
        # Este comando corre en cada arranque del contenedor. Si la base ya
        # tiene puntos no hace nada: así no duplica los ejemplos ni vuelve a
        # crear los que el usuario editó o eliminó.
        if Punto.objects.exists():
            self.stdout.write("Ya hay puntos cargados: no se agregan los de ejemplo.")
            return

        # loaddata es el comando de Django que lee un fixture y lo guarda.
        call_command("loaddata", FIXTURE, verbosity=0)
        self.stdout.write(
            self.style.SUCCESS(f"Se cargaron {Punto.objects.count()} puntos de ejemplo.")
        )
