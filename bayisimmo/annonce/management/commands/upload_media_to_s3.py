import os
from django.core.files import File
from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from django.conf import settings


class Command(BaseCommand):
    help = "Upload tous les fichiers du dossier media local vers S3"

    def handle(self, *args, **options):
        local_media_root = os.path.join(settings.BASE_DIR, 'media')
        if not os.path.exists(local_media_root):
            self.stdout.write(self.style.ERROR(f"Le dossier 'media/' n'existe pas à {local_media_root}"))
            return

        for dirpath, dirnames, filenames in os.walk(local_media_root):
            for filename in filenames:
                local_path = os.path.join(dirpath, filename)
                relative_path = os.path.relpath(local_path, local_media_root)
                s3_path = f"{relative_path}".replace("\\", "/")  # pour Windows

                # Évite d'écraser si déjà présent (optionnel)
                if default_storage.exists(s3_path):
                    self.stdout.write(self.style.WARNING(f"Fichier déjà présent dans S3 : {s3_path}"))
                    continue

                with open(local_path, "rb") as f:
                    file_obj = File(f)
                    default_storage.save(s3_path, file_obj)
                    self.stdout.write(self.style.SUCCESS(f"Téléchargé : {s3_path}"))
