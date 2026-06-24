from pathlib import Path

from django.core.files.images import ImageFile
from django.core.management.base import BaseCommand
from wagtail.images.models import Image

from cms_app.models import KommuneConfig

FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "fixtures" / "kommunevapen"


class Command(BaseCommand):
    help = "Seed Eidsvoll kommune config into Wagtail CMS"

    def handle(self, *args, **options):
        logo = self._load_logo("eidsvoll_kommune.png", "Eidsvoll kommunevåpen")

        KommuneConfig.objects.update_or_create(
            municipality_id="3240",
            defaults={
                "name": "Eidsvoll",
                "logo": logo,
                "primary_color": "#015C28",
                "secondary_color": "#015C28",
                "contact_email": "postmottak@eidsvoll.kommune.no",
                "contact_phone": "66 10 70 00",
                "contact_website": "https://www.eidsvoll.kommune.no",
                "visiting_address_line1": "Rådhusgata 1",
                "visiting_address_line2": "2080 Eidsvoll",
                "org_number": "964948798",
                "welcome_message": "Velkommen til Eidsvoll kommune",
                "opening_hours": [
                    ("periode", {
                        "fra_dag": "Mandag",
                        "til_dag": "Fredag",
                        "apner": "08:00",
                        "stenger": "15:30",
                    }),
                ],
            },
        )

        self.stdout.write(self.style.SUCCESS("Eidsvoll seeded OK (municipality_id=3240)"))

    def _load_logo(self, filename, title):
        path = FIXTURES_DIR / filename
        if not path.exists():
            self.stdout.write(self.style.WARNING(f"Logo ikke funnet: {path} — seeder uten logo."))
            return None
        with open(path, "rb") as f:
            image = Image(title=title)
            image.file.save(filename, ImageFile(f))
            image.save()
        return image
