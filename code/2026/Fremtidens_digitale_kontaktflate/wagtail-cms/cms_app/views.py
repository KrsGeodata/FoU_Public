"""API views for serving municipality configuration to the frontend."""
import os
from django.http import JsonResponse
from django.views import View

# Public-facing base URL used to build absolute media URLs returned to the browser.
# Must match the URL the browser uses to reach this service (e.g. http://localhost:8002).
_PUBLIC_BASE_URL = os.getenv("WAGTAIL_PUBLIC_URL", "http://localhost:8002")

from cms_app.models import KommuneConfig


class MunicipalityConfigView(View):
    def get(self, request, municipality_id):
        try:
            config = KommuneConfig.objects.get(municipality_id=municipality_id)
        except KommuneConfig.DoesNotExist:
            return JsonResponse({"error": "Municipality not found"}, status=404)

        if config.logo:
            logo_url = f"{_PUBLIC_BASE_URL}{config.logo.file.url}"
        else:
            logo_url = ""

        links = [
            {"label": block.value["label"], "url": str(block.value["url"])}
            for block in config.links
        ]

        return JsonResponse(
            {
                "municipality_id": config.municipality_id,
                "name": config.name,
                "logo_url": logo_url,
                "colors": {
                    "primary": config.primary_color,
                    "secondary": config.secondary_color,
                },
                "contact": {
                    "email": config.contact_email,
                    "phone": config.contact_phone,
                    "website": config.contact_website,
                    "visiting_address_line1": config.visiting_address_line1,
                    "visiting_address_line2": config.visiting_address_line2,
                    "opening_hours": [
                        (
                            f"{b.value['fra_dag']}: {b.value['apner'].strftime('%H:%M')}–{b.value['stenger'].strftime('%H:%M')}"
                            if b.value['fra_dag'] == b.value['til_dag']
                            else f"{b.value['fra_dag']}–{b.value['til_dag']}: {b.value['apner'].strftime('%H:%M')}–{b.value['stenger'].strftime('%H:%M')}"
                        )
                        for b in config.opening_hours
                    ],
                },
                "org_number": config.org_number,
                "content_blocks": {
                    "welcome_message": config.welcome_message,
                },
                "links": links,
                # Tooltip texts for info buttons throughout the app.
                "tooltips": {
                    k: v for k, v in {
                        "propertyArea": config.tooltip_property_area,
                        "gnr": config.tooltip_gnr,
                        "bnr": config.tooltip_bnr,
                        "fnr": config.tooltip_fnr,
                        "snr": config.tooltip_snr,
                        "eierbrok": config.tooltip_eierbrok,
                        "avgifter_gebyr": config.tooltip_avgifter_gebyr,
                        "avgifter_grunnlag": config.tooltip_avgifter_grunnlag,
                        "avgifter_enhet": config.tooltip_avgifter_enhet,
                        "avgifter_enhetspris": config.tooltip_avgifter_enhetspris,
                        "avgifter_periode": config.tooltip_avgifter_periode,
                        "avgifter_belop": config.tooltip_avgifter_belop,
                        "avgifter_arsbelop": config.tooltip_avgifter_arsbelop,
                    }.items() if v
                },
            }
        )
