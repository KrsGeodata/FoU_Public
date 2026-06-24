from pathlib import Path

from django.core.files.images import ImageFile
from django.core.management.base import BaseCommand
from wagtail.images.models import Image
from wagtail.models import Page

from cms_app.models import KommuneConfig

FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "fixtures" / "kommunevapen"


class Command(BaseCommand):
    help = "Seed Kristiansand kommune config into Wagtail CMS"

    def handle(self, *args, **options):
        self._delete_welcome_page()

        logo = self._load_logo("kristiansand_kommune.png", "Kristiansand kommunevåpen")

        KommuneConfig.objects.update_or_create(
            municipality_id="4204",
            defaults={
                "name": "Kristiansand",
                "logo": logo,
                "primary_color": "#046A38",
                "secondary_color": "#046A38",
                "contact_email": "postmottak@kristiansand.kommune.no",
                "contact_phone": "38 07 50 00",
                "contact_website": "https://www.kristiansand.kommune.no",
                "visiting_address_line1": "Rådhusgata 18",
                "visiting_address_line2": "4611 Kristiansand",
                "org_number": "964965137",
                "welcome_message": "Velkommen til Kristiansand kommune",
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

        self.stdout.write(self.style.SUCCESS("Kristiansand seeded OK (municipality_id=4204)"))

    def _delete_welcome_page(self):
        # Remove the default Wagtail welcome page so the admin login is the entry point
        pages = Page.objects.filter(slug="home", depth=2)
        if pages.exists():
            pages.delete()
            self.stdout.write("Default welcome page deleted.")

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
