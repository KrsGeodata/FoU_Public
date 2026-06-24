from pathlib import Path

from django.core.files.images import ImageFile
from django.core.management.base import BaseCommand
from wagtail.images.models import Image

from cms_app.models import KommuneConfig

FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "fixtures" / "kommunevapen"


class Command(BaseCommand):
    help = "Seed Oslo kommune config into Wagtail CMS"

    def handle(self, *args, **options):
        logo = self._load_logo("oslo_kommune.png", "Oslo kommunevåpen")

        KommuneConfig.objects.update_or_create(
            municipality_id="0301",
            defaults={
                "name": "Oslo",
                "logo": logo,
                "primary_color": "#2A2859",
                "secondary_color": "#2A2859",
                "contact_email": "postmottak@oslo.kommune.no",
                "contact_phone": "21 80 21 80",
                "contact_website": "https://www.oslo.kommune.no",
                "visiting_address_line1": "Rådhuset, Rådhusplassen 1",
                "visiting_address_line2": "0037 Oslo",
                "org_number": "958935420",
                "welcome_message": "Velkommen til Oslo kommune",
                "opening_hours": [
                    ("periode", {
                        "fra_dag": "Mandag",
                        "til_dag": "Fredag",
                        "apner": "0900",
                        "stenger": "1600",
                    }),
                ],
            },
        )

        self.stdout.write(self.style.SUCCESS("Oslo seeded OK (municipality_id=0301)"))

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
