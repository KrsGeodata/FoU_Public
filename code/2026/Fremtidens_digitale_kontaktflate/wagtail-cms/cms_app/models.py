import re
from django.core.exceptions import ValidationError
from django.db import models
from wagtail.admin.panels import FieldPanel, HelpPanel, MultiFieldPanel
from wagtail.fields import StreamField
from wagtail import blocks
from wagtail.snippets.models import register_snippet


def validate_hex_color(value):
    if not re.fullmatch(r"#[0-9A-Fa-f]{6}", value):
        raise ValidationError(f"'{value}' er ikke en gyldig hex-farge. Bruk formatet #RRGGBB.")


@register_snippet
class KommuneConfig(models.Model):
    municipality_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=200)
    logo = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    primary_color = models.CharField(max_length=7, default="#000000", validators=[validate_hex_color])
    secondary_color = models.CharField(max_length=7, default="#000000", validators=[validate_hex_color])
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    contact_website = models.URLField()
    visiting_address_line1 = models.CharField(max_length=200, blank=True, help_text="Gateadresse, f.eks. Rådhusgata 18")
    visiting_address_line2 = models.CharField(max_length=200, blank=True, help_text="Postnummer og sted, f.eks. 4604 Kristiansand")

    # Opening hours as a list of day-range + time pairs.
    # Each entry covers a span of weekdays (e.g. Monday–Friday or Saturday–Saturday).
    opening_hours = StreamField(
        [
            (
                "periode",
                blocks.StructBlock(
                    [
                        ("fra_dag", blocks.ChoiceBlock(
                            choices=[
                                ("Mandag", "Mandag"),
                                ("Tirsdag", "Tirsdag"),
                                ("Onsdag", "Onsdag"),
                                ("Torsdag", "Torsdag"),
                                ("Fredag", "Fredag"),
                                ("Lørdag", "Lørdag"),
                                ("Søndag", "Søndag"),
                            ],
                            label="Fra dag",
                        )),
                        ("til_dag", blocks.ChoiceBlock(
                            choices=[
                                ("Mandag", "Mandag"),
                                ("Tirsdag", "Tirsdag"),
                                ("Onsdag", "Onsdag"),
                                ("Torsdag", "Torsdag"),
                                ("Fredag", "Fredag"),
                                ("Lørdag", "Lørdag"),
                                ("Søndag", "Søndag"),
                            ],
                            label="Til dag",
                        )),
                        ("apner", blocks.TimeBlock(label="Åpner")),
                        ("stenger", blocks.TimeBlock(label="Stenger")),
                    ],
                    label="Åpningstid",
                ),
            )
        ],
        blank=True,
        use_json_field=True,
    )
    org_number = models.CharField(max_length=20)
    welcome_message = models.CharField(max_length=500, blank=True)

    # Tooltip text shown next to each field label in the property info card.
    # Defaults match the frontend fallback strings so the UI is never empty
    # even before an editor has updated these values.
    tooltip_property_area = models.TextField(
        blank=True,
        default="Totalt registrert areal for eiendommen.",
        help_text="Vises ved siden av «Eiendomsareal» i eiendomskortet.",
    )
    tooltip_gnr = models.TextField(
        blank=True,
        default="Hovednummer som identifiserer gården i matrikkelen.",
        help_text="Vises ved siden av «Gårdsnummer» i eiendomskortet.",
    )
    tooltip_bnr = models.TextField(
        blank=True,
        default="Undernummer for den enkelte eiendom under gårdsnummeret.",
        help_text="Vises ved siden av «Bruksnummer» i eiendomskortet.",
    )
    tooltip_fnr = models.TextField(
        blank=True,
        default="Nummer for festetomt under gårdsnummeret.",
        help_text="Vises ved siden av «Festenummer» i eiendomskortet.",
    )
    tooltip_snr = models.TextField(
        blank=True,
        default="Nummer som identifiserer seksjonen i en seksjonert eiendom.",
        help_text="Vises ved siden av «Seksjonsnummer» i eiendomskortet.",
    )
    tooltip_eierbrok = models.TextField(
        blank=True,
        default="Eierandel uttrykt som brøkdel av eiendommen.",
        help_text="Vises ved siden av «Eierbrøk» i eiendomskortet.",
    )

    # Tooltip text for each column header in the municipal fees table.
    tooltip_avgifter_gebyr = models.TextField(
        blank=True,
        default="Hva du betaler for, for eksempel renovasjon eller eiendomsskatt.",
        help_text="Vises ved siden av «Hva gebyret gjelder» i gebyrtabellen.",
    )
    tooltip_avgifter_grunnlag = models.TextField(
        blank=True,
        default="Verdien eller antallet gebyret beregnes ut fra, for eksempel areal eller antall enheter.",
        help_text="Vises ved siden av «Grunnlag» i gebyrtabellen.",
    )
    tooltip_avgifter_enhet = models.TextField(
        blank=True,
        default="Måleenheten som brukes i beregningen, for eksempel stk, m² eller o/oo.",
        help_text="Vises ved siden av «Enhet» i gebyrtabellen.",
    )
    tooltip_avgifter_enhetspris = models.TextField(
        blank=True,
        default="Pris per enhet i grunnlaget.",
        help_text="Vises ved siden av «Enhetspris» i gebyrtabellen.",
    )
    tooltip_avgifter_periode = models.TextField(
        blank=True,
        default="Fra- og til-dato for gjeldende gebyrperiode.",
        help_text="Vises ved siden av «Periode» i gebyrtabellen.",
    )
    tooltip_avgifter_belop = models.TextField(
        blank=True,
        default="Løpende beløp for gjeldende periode.",
        help_text="Vises ved siden av «Beløp» i gebyrtabellen.",
    )
    tooltip_avgifter_arsbelop = models.TextField(
        blank=True,
        default="Estimert total kostnad for ett år.",
        help_text="Vises ved siden av «Årsbeløp» i gebyrtabellen.",
    )

    links = StreamField(
        [
            (
                "link",
                blocks.StructBlock(
                    [
                        ("label", blocks.CharBlock()),
                        ("url", blocks.URLBlock()),
                    ]
                ),
            )
        ],
        blank=True,
        use_json_field=True,
    )

    panels = [
        HelpPanel(
            heading="Redigerbar kommuneprofil",
            content=(
                "<p>Denne visningen viser alt en administrator kan vedlikeholde for kommunen:</p>"
                "<ul>"
                "<li>branding (logo og farger)</li>"
                "<li>kontakt og åpningstider</li>"
                "<li>innhold og lenker</li>"
                "<li>forklaringstekster for felter i Eiendomsinfo</li>"
                "</ul>"
            ),
            classname="cms-config-intro",
        ),
        FieldPanel("municipality_id"),
        FieldPanel("name"),
        FieldPanel("logo"),
        MultiFieldPanel(
            [
                FieldPanel("primary_color"),
                FieldPanel("secondary_color"),
            ],
            heading="Farger",
            classname="cms-config-panel",
        ),
        MultiFieldPanel(
            [
                FieldPanel("contact_email"),
                FieldPanel("contact_phone"),
                FieldPanel("contact_website"),
                MultiFieldPanel(
                    [
                        FieldPanel("visiting_address_line1"),
                        FieldPanel("visiting_address_line2"),
                    ],
                    heading="Besøksadresse",
                ),
                FieldPanel("opening_hours"),
            ],
            heading="Kontaktinformasjon",
            classname="cms-config-panel",
        ),
        MultiFieldPanel(
            [
                FieldPanel("org_number"),
                FieldPanel("welcome_message"),
                FieldPanel("links"),
            ],
            heading="Innhold og lenker",
            classname="cms-config-panel",
        ),
        MultiFieldPanel(
            [
                FieldPanel("tooltip_property_area"),
                FieldPanel("tooltip_gnr"),
                FieldPanel("tooltip_bnr"),
                FieldPanel("tooltip_fnr"),
                FieldPanel("tooltip_snr"),
                FieldPanel("tooltip_eierbrok"),
            ],
            heading="Forklaringstekster (tooltips) — Eiendomsinfo",
            classname="cms-config-panel",
        ),
        MultiFieldPanel(
            [
                FieldPanel("tooltip_avgifter_gebyr"),
                FieldPanel("tooltip_avgifter_grunnlag"),
                FieldPanel("tooltip_avgifter_enhet"),
                FieldPanel("tooltip_avgifter_enhetspris"),
                FieldPanel("tooltip_avgifter_periode"),
                FieldPanel("tooltip_avgifter_belop"),
                FieldPanel("tooltip_avgifter_arsbelop"),
            ],
            heading="Forklaringstekster (tooltips) — Kommunale gebyr",
            classname="cms-config-panel",
        ),
    ]

    def __str__(self):
        return f"{self.name} ({self.municipality_id})"

    class Meta:
        verbose_name = "Kommune-konfigurasjon"
        verbose_name_plural = "Kommune-konfigurasjoner"
