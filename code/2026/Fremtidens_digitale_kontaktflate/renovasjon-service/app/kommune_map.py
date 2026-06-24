# kommune_map.py
# Maps kommunenummer (4-digit string) → provider name.
# Source: Kartverket kommunenummer register + renovasjon_norge.json
# Avfall Sør is overridden here — the JSON incorrectly marks them as Norkart.

_MAP: dict[str, str] = {
    # Oslo
    "0301": "oslo",
    # Viken (Østfold)
    "3101": "norkart",  # Halden
    "3103": "norkart",  # Moss
    "3110": "norkart",  # Hvaler — NOTE: fraksjoner=0, may not work
    "3114": "norkart",  # Våler
    "3116": "norkart",  # Skiptvet
    "3124": "norkart",  # Aremark
    # Viken (Akershus vest)
    "3201": "norkart",  # Bærum
    "3203": "norkart",  # Asker
    "3216": "norkart",  # Vestby
    "3228": "norkart",  # Nes
    # Viken (Numedal/Hallingdal)
    "3303": "norkart",  # Kongsberg
    # Vestfold
    "3901": "norkart",  # Horten
    "3903": "norkart",  # Holmestrand
    "3905": "norkart",  # Tønsberg
    "3907": "norkart",  # Sandefjord
    "3909": "norkart",  # Larvik
    "3911": "norkart",  # Færder
    # Telemark
    "4001": "norkart",  # Porsgrunn
    "4003": "norkart",  # Skien
    "4005": "norkart",  # Notodden
    "4010": "norkart",  # Siljan
    "4012": "norkart",  # Bamble
    "4014": "norkart",  # Kragerø
    "4016": "norkart",  # Drangedal
    "4018": "norkart",  # Nome
    "4020": "norkart",  # Midt-Telemark
    "4022": "norkart",  # Seljord
    "4028": "norkart",  # Kviteseid
    "4030": "norkart",  # Nissedal
    "4032": "norkart",  # Fyresdal
    "4034": "norkart",  # Tokke
    "4036": "norkart",  # Vinje
    # Innlandet (Lillehammer-regionen)
    "3405": "norkart",  # Lillehammer
    "3436": "norkart",  # Nord-Fron
    "3437": "norkart",  # Sel
    # Innlandet (Elverum-regionen)
    "3417": "norkart",  # Grue
    "3420": "norkart",  # Elverum
    "3427": "norkart",  # Tynset
    # Agder (Aust-Agder)
    "4201": "norkart",  # Risør
    "4211": "norkart",  # Gjerstad
    "4212": "norkart",  # Vegårshei
    "4213": "norkart",  # Tvedestrand
    "4215": "norkart",  # Lillesand
    "4216": "norkart",  # Birkenes
    "4217": "norkart",  # Åmli
    "4218": "norkart",  # Iveland
    "4219": "norkart",  # Evje og Hornnes
    "4220": "norkart",  # Bygland
    "4221": "norkart",  # Valle
    "4222": "norkart",  # Bykle
    "4224": "norkart",  # Åseral
    "4226": "norkart",  # Hægebostad
    "4227": "norkart",  # Kvinesdal
    "4228": "norkart",  # Sirdal
    # Agder (Vest-Agder)
    "4205": "norkart",  # Lindesnes
    "4206": "norkart",  # Farsund
    "4207": "norkart",  # Flekkefjord
    "4225": "norkart",  # Lyngdal
    # Rogaland (Dalane)
    "1101": "norkart",  # Eigersund
    "1111": "norkart",  # Sokndal
    "1112": "norkart",  # Lund
    "1114": "norkart",  # Bjerkreim
    "1149": "norkart",  # Karmøy
    # Akershus / Norkart (ROAF)
    "3205": "norkart",  # Lillestrøm
    "3222": "norkart",  # Lørenskog
    "3232": "norkart",  # Nittedal
    "3224": "norkart",  # Rælingen
    "3230": "norkart",  # Gjerdrum
    "3220": "norkart",  # Enebakk
    "3226": "norkart",  # Aurskog-Høland
    # Akershus / Norkart (ØRAS)
    "3240": "norkart",  # Eidsvoll
    "3242": "norkart",  # Hurdal
    "3238": "norkart",  # Nannestad
    "3209": "norkart",  # Ullensaker
    # Akershus / Norkart (FoRen)
    "3207": "norkart",  # Nordre Follo
    "3214": "norkart",  # Frogn
    "3212": "norkart",  # Nesodden
    "3218": "norkart",  # Ås
    # Drammen-regionen (RfD)
    "3301": "norkart",  # Drammen
    "3312": "norkart",  # Lier
    "3316": "norkart",  # Modum
    "3332": "norkart",  # Sigdal
    "3314": "norkart",  # Øvre Eiker
    # Østfold (ØIR)
    "3107": "norkart",  # Fredrikstad
    "3105": "norkart",  # Sarpsborg
    "3112": "norkart",  # Råde
    # Østfold (Indre Østfold Renovasjon)
    "3118": "norkart",  # Indre Østfold
    "3122": "norkart",  # Marker
    "3120": "norkart",  # Rakkestad
    # Innlandet (Sirkula)
    "3403": "norkart",  # Hamar
    "3411": "norkart",  # Ringsaker
    "3413": "norkart",  # Stange
    "3412": "norkart",  # Løten
    # Innlandet (Horisont)
    "3407": "norkart",  # Gjøvik
    "3443": "norkart",  # Vestre Toten
    "3442": "norkart",  # Østre Toten
    "3447": "norkart",  # Søndre Land
    "3448": "norkart",  # Nordre Land
    # Innlandet (GIR)
    "3401": "norkart",  # Kongsvinger
    "3415": "norkart",  # Sør-Odal
    "3414": "norkart",  # Nord-Odal
    "3416": "norkart",  # Eidskog
    # Agder (Agder Renovasjon)
    "4203": "norkart",  # Arendal
    "4202": "norkart",  # Grimstad
    "4214": "norkart",  # Froland
    # Agder (Avfall Sør — override from JSON)
    "4204": "avfallsor",  # Kristiansand
    "4223": "avfallsor",  # Vennesla
    # Rogaland — Stavanger-region (custom HTML API via IVAR)
    "1103": "stavanger",  # Stavanger
    "1108": "stavanger",  # Sandnes
    "1127": "stavanger",  # Randaberg
    "1124": "stavanger",  # Sola
    "1120": "stavanger",  # Klepp
    "1119": "stavanger",  # Hå
    "1122": "stavanger",  # Gjesdal
    "1130": "stavanger",  # Strand
    "1121": "stavanger",  # Time
    # Rogaland (RYMI)
    "1133": "norkart",  # Hjelmeland
    "1134": "norkart",  # Suldal
    "1135": "norkart",  # Sauda
    "1160": "norkart",  # Vindafjord
    # Vestland (BIR — Bergen)
    "4601": "bir",
    "4627": "bir",  # Askøy
    "4623": "bir",  # Samnanger
    "4624": "bir",  # Bjørnafjorden (tidl. Os)
    "4628": "bir",  # Vaksdal
    "4629": "bir",  # Modalen
    "4630": "bir",  # Osterøy
    "4621": "bir",  # Voss
    "4622": "bir",  # Kvam
    # Vestland (NGIR)
    "4631": "norkart",  # Alver
    "4632": "norkart",  # Austrheim
    "4633": "norkart",  # Fedje
    "4634": "norkart",  # Masfjorden
    "4635": "norkart",  # Gulen
    # Vestland (SIM)
    "4614": "norkart",  # Stord
    "4613": "norkart",  # Bømlo
    "4615": "norkart",  # Fitjar
    "4617": "norkart",  # Kvinnherad
    "4612": "norkart",  # Sveio
    "4616": "norkart",  # Tysnes
    "4625": "norkart",  # Austevoll
    # Vestland (SIMAS)
    "4640": "norkart",  # Sogndal
    "4644": "norkart",  # Luster
    "4642": "norkart",  # Lærdal
    "4643": "norkart",  # Årdal
    "4641": "norkart",  # Aurland
    "4638": "norkart",  # Høyanger
    "4639": "norkart",  # Vik
    # Vestland (Sunnfjord Miljøverk)
    "4647": "norkart",  # Sunnfjord (inkl. tidl. Førde, Naustdal, Gaular, Jølster)
    "4645": "norkart",  # Askvoll
    "4646": "norkart",  # Fjaler
    "4637": "norkart",  # Hyllestad
    # Vestland (Nordfjord Miljøverk)
    "4651": "norkart",  # Stryn
    "4650": "norkart",  # Gloppen
    "4649": "norkart",  # Stad (inkl. tidl. Selje, Eid, Vågsøy)
    "4648": "norkart",  # Bremanger
    "4602": "norkart",  # Kinn (inkl. tidl. Flora, Vågsøy)
    # Møre og Romsdal (ÅRIM)
    "1508": "norkart",  # Ålesund
    "1531": "norkart",  # Sula
    "1532": "norkart",  # Giske
    "1580": "norkart",  # Haram
    # Møre og Romsdal (VØR/ReMidt)
    "1506": "norkart",  # Molde
    "1539": "norkart",  # Rauma
    "1547": "norkart",  # Aukra
    "1579": "norkart",  # Hustadvika (tidl. Fræna)
    "1535": "norkart",  # Vestnes
    # Trøndelag (TrøndelagRenovasjon)
    "5001": "norkart",  # Trondheim
    "5031": "norkart",  # Malvik
    "5028": "norkart",  # Melhus
    "5029": "norkart",  # Skaun
    # Trøndelag (Innherred Renovasjon)
    "5038": "norkart",  # Verdal
    "5037": "norkart",  # Levanger
    "5053": "norkart",  # Inderøy
    "5006": "norkart",  # Steinkjer
    # Trøndelag (MNA)
    "5007": "norkart",  # Namsos
    "5047": "norkart",  # Overhalla
    "5049": "norkart",  # Flatanger
    "5045": "norkart",  # Grong
    "5044": "norkart",  # Namsskogan
    "5043": "norkart",  # Raarvihke (tidl. Røyrvik)
    "5042": "norkart",  # Lierne
    "5041": "norkart",  # Snåase (tidl. Snåsa)
    "5060": "norkart",  # Nærøysund
    # Nordland (RENO-VEST)
    "1866": "norkart",  # Hadsel
    "1870": "norkart",  # Sortland
    "1868": "norkart",  # Øksnes
    "1867": "norkart",  # Bø
    "1871": "norkart",  # Andøy
    "1851": "norkart",  # Lødingen
    # Nordland (IRIS)
    "1804": "norkart",  # Bodø
    "1841": "norkart",  # Fauske
    "1840": "norkart",  # Saltdal
    "1848": "norkart",  # Steigen
    "1839": "norkart",  # Beiarn
    "1838": "norkart",  # Gildeskål
    # Nordland (Helgeland Miljøverk)
    "1833": "norkart",  # Rana
    "1832": "norkart",  # Hemnes
    "1828": "norkart",  # Nesna
    "1834": "norkart",  # Lurøy
    "1835": "norkart",  # Træna
    "1836": "norkart",  # Rødøy
    # Nordland (Helgeland Sør)
    "1811": "norkart",  # Bindal
    "1812": "norkart",  # Sømna
    "1813": "norkart",  # Brønnøy
    "1815": "norkart",  # Vega
    "1820": "norkart",  # Alstahaug
    # Nordland (Lofoten)
    "1860": "norkart",  # Vestvågøy
    "1865": "norkart",  # Vågan
    "1806": "norkart",  # Narvik
    # Nordland (Helgeland Nord)
    "1824": "norkart",  # Vefsn
    # Troms (Remiks)
    "5501": "norkart",  # Tromsø
    "5532": "norkart",  # Balsfjord
    # Troms (SAREN)
    "5503": "norkart",  # Harstad
    "5510": "norkart",  # Kvæfjord
    # Troms (øvrige)
    "5512": "norkart",  # Dielddanuorri (Tjeldsund)
    "5514": "norkart",  # Ibestad
    "5524": "norkart",  # Målselv
    "5526": "norkart",  # Sørreisa
    "5530": "norkart",  # Senja
    "5534": "norkart",  # Karlsøy
    "5516": "norkart",  # Gratangen
    "5522": "norkart",  # Salangen
    "5518": "norkart",  # Lavangen
    "5528": "norkart",  # Dyrøy
    "5540": "norkart",  # Kåfjord
    "5542": "norkart",  # Skjervøy
    "5544": "norkart",  # Nordreisa
    "5546": "norkart",  # Kvænangen
    "5536": "norkart",  # Lyngen
    # Finnmark
    "5601": "norkart",  # Alta
    "5603": "norkart",  # Hammerfest
    "5607": "norkart",  # Vadsø
    "5605": "norkart",  # Sør-Varanger (Kirkenes)
    "5610": "norkart",  # Kárášjohka (Karasjok)
    "5612": "norkart",  # Guovdageaidnu (Kautokeino)
    "5616": "norkart",  # Hasvik
    "5618": "norkart",  # Måsøy
    "5620": "norkart",  # Nordkapp
    "5622": "norkart",  # Porsanger
    "5624": "norkart",  # Lebesby
    "5614": "norkart",  # Loppa
    "5628": "norkart",  # Tana
    "5636": "norkart",  # Nesseby
    "5630": "norkart",  # Berlevåg
    "5626": "norkart",  # Gamvik
    "5634": "norkart",  # Vardø
    "5632": "norkart",  # Båtsfjord
    # Nordland (additional)
    "1874": "norkart",  # Moskenes
    "1859": "norkart",  # Flakstad
    "1826": "norkart",  # Hattfjelldal
    "1825": "norkart",  # Grane
    "1822": "norkart",  # Leirfjord
    "1827": "norkart",  # Dønna
    "1816": "norkart",  # Vevelstad
    "1818": "norkart",  # Herøy
    "1853": "norkart",  # Evenes
    # Innlandet (additional Gudbrandsdalen)
    "3432": "norkart",  # Lesja
    "3431": "norkart",  # Dovre
    "3429": "norkart",  # Folldal
    "3424": "norkart",  # Rendalen
    "3423": "norkart",  # Stor-Elvdal
    "3422": "norkart",  # Åmot
    "3421": "norkart",  # Trysil
    "3428": "norkart",  # Alvdal
    "3426": "norkart",  # Tolga
    "3425": "norkart",  # Engerdal
    "3435": "norkart",  # Vågå
    "3434": "norkart",  # Lom
    "3433": "norkart",  # Skjåk
    "3439": "norkart",  # Ringebu
    "3438": "norkart",  # Sør-Fron
    "3440": "norkart",  # Øyer
    "3441": "norkart",  # Gausdal
    "3430": "norkart",  # Os (Innlandet)
    # Numedal / Hallingdal (confirmed Norkart)
    "3338": "norkart",  # Nore og Uvdal
    "3336": "norkart",  # Rollag
    "3334": "norkart",  # Flesberg
    # Telemark (additional)
    "4024": "norkart",  # Hjartdal
    # Vestland (additional)
    "4618": "norkart",  # Ullensvang
    "4626": "norkart",  # Øygarden
    # Møre og Romsdal (additional)
    "1578": "norkart",  # Fjord
    "1525": "norkart",  # Stranda
    "1528": "norkart",  # Sykkylven
    "1520": "norkart",  # Ørsta
    "1516": "norkart",  # Ulstein
    "1517": "norkart",  # Hareid
    "1511": "norkart",  # Vanylven
    "1577": "norkart",  # Volda
    "1557": "norkart",  # Gjemnes
    # Møre og Romsdal (Nordmøre — Renovasjon IKS Midt)
    "1505": "norkart",  # Kristiansund
    "1554": "norkart",  # Averøy
    "1560": "norkart",  # Tingvoll
    "1563": "norkart",  # Sunndal
    "1566": "norkart",  # Surnadal
    "1573": "norkart",  # Smøla
    "1576": "norkart",  # Aure
    # Trøndelag (additional)
    "5046": "norkart",  # Høylandet
    "5026": "norkart",  # Holtålen
    "5025": "norkart",  # Røros
    "5020": "norkart",  # Osen
    "5052": "norkart",  # Leka
    # Trøndelag (Inntrøndelag Renovasjon)
    "5035": "norkart",  # Stjørdal
    "5036": "norkart",  # Frosta
    "5034": "norkart",  # Meråker
    "5032": "norkart",  # Selbu
    "5033": "norkart",  # Tydal
    # Trøndelag (Orkland-regionen)
    "5059": "norkart",  # Orkland
    "5027": "norkart",  # Midtre Gauldal
    "5022": "norkart",  # Rennebu
    "5021": "norkart",  # Oppdal
    "5057": "norkart",  # Ørland
    "5054": "norkart",  # Indre Fosen
    # Trøndelag (kyst)
    "5055": "norkart",  # Heim
    "5056": "norkart",  # Hitra
    "5014": "norkart",  # Frøya
    "5058": "norkart",  # Åfjord
    "5061": "norkart",  # Rindal
    # Nordland (Helgeland Sør additional)
    "1515": "norkart",  # Herøy (Nordland)
    "1514": "norkart",  # Sande (Nordland)
    # Nordland (additional)
    "1837": "norkart",  # Meløy
    "1845": "norkart",  # Sørfold
    "1856": "norkart",  # Røst
    "1857": "norkart",  # Værøy
    "1875": "norkart",  # Hamarøy
    # Rogaland (Haugaland Avfall)
    "1106": "norkart",  # Haugesund
    "1144": "norkart",  # Kvitsøy
    "1145": "norkart",  # Bokn
    "1146": "norkart",  # Tysvær
    "1151": "norkart",  # Utsira
    # Viken (Ringerike Avfallsselskap)
    "3305": "norkart",  # Ringerike
    "3310": "norkart",  # Hole
    "3234": "norkart",  # Lunner
    "3236": "norkart",  # Jevnaker
    # Viken (Hallingdal Renovasjon)
    "3318": "norkart",  # Krødsherad
    "3320": "norkart",  # Flå
    "3322": "norkart",  # Nesbyen
    "3324": "norkart",  # Gol
    "3326": "norkart",  # Hemsedal
    "3328": "norkart",  # Ål
    "3330": "norkart",  # Hol
    # Innlandet (Hadeland og Ringerike Avfallsselskap)
    "3446": "norkart",  # Gran
    # Innlandet (Valdres Renovasjon)
    "3449": "norkart",  # Sør-Aurdal
    "3450": "norkart",  # Etnedal
    "3451": "norkart",  # Nord-Aurdal
    "3452": "norkart",  # Vestre Slidre
    "3453": "norkart",  # Øystre Slidre
    "3454": "norkart",  # Vang
    # Innlandet (Solør Renovasjon)
    "3418": "norkart",  # Åsnes
    "3419": "norkart",  # Våler
    # Telemark (additional)
    "4026": "norkart",  # Tinn
    # Vestland (Hardanger og Voss Renovasjon)
    "4619": "norkart",  # Eidfjord
    "4620": "norkart",  # Ulvik
    # Vestland (Haugaland Avfall)
    "4611": "norkart",  # Etne
    # Vestland (SIMAS additional)
    "4636": "norkart",  # Solund
    # Troms (additional)
    "5520": "norkart",  # Bardu
    "5538": "norkart",  # Storfjord
}


def get_provider_for_kommune(kommunenummer: str) -> str | None:
    """Returns provider name for a kommunenummer, or None if unsupported."""
    return _MAP.get(kommunenummer)
