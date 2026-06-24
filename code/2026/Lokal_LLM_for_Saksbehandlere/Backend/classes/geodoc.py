from pydantic import BaseModel
from typing import Optional

# Data model for geodoc based on the table structure on the site.
# NB! The data types are not correctly defined, as I don't have the actual data to determine the correct types.
#     Look more into this when we get access to the API and see how the structure of the data responses are.
# API documentation: https://docs.geodoc.no/nb/geodocapi

class Geodoc(BaseModel):
  arkivdel: str           # Arkivdel
  gid: str                # GID
  sak: str                # Sak
  dokument: str           # Dokument
  dokumentkategori: str   # Dokumentkategori
  saksdato: str           # Saksdato
  journaldato: str        # Journaldato
  sakMerknad: str         # SakMerknad
  filTittel: str          # FilTittel
  hjemmel: str            # Hjemmel
  bid: str                # BID
  gid_r: str              # GID/R
  søknadstype: str        # Søknadstype
  sakstype: str           # Sakstype
  dispensasjon: str       # Dispensasjon
  tiltaksart: str         # Tiltaksart
  sakskategori: str       # Sakskategori
  boksnummer: str         # Boksnummer
  adresse: str            # Adresse
  opprinnelig_gid: str    # Opprinnelig GID
  opprinnelse: str        # Opprinnelse
  saksår: str             # Saksår
  sakssekvens: str        # Sakssekvens
  adressekode: str        # Adressekode
  weblager_scanID: str    # Weblager-ScanID
  weblager_docID: str     # Weblager-DocID
  proveniens: str         # Proveniens
  saksnummer_concat: str  # Saksnummer_Concat
  geodoc_id: str          # GeoDoc ID