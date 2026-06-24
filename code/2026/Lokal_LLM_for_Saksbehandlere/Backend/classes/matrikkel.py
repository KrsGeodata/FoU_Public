from pydantic import BaseModel
from typing import Optional

# Data model for matrikkel based on the matrikkel JSON structure provided in the link below.
# https://github.com/KrsGeodata/801_26_lokal-llm/blob/master/docs/matrikkel_json.md

#Note:
# - All fields are optional and default to None if not provided. Adjust as necessary 
#   based on actual data requirements. But it's set this way in the beginning to allow 
#   for flexibility in handling incomplete data when testing and developing the application.

class Byggningsreferanse(BaseModel):
    type: Optional[str] = None                  # TYPE
    referanse: Optional[str] = None             # REFERANSE

class Vedtak(BaseModel):
    status: Optional[str] = None                # STATUS
    dato: Optional[str] = None                  # DATO
    årsak: Optional[str] = None                 # ÅRSAK
    referanse: Optional[str] = None             # REFERANSE
    reg_dato: Optional[str] = None              # REG.DATO
    slettet_dato: Optional[str] = None          # SLETTET.DATO

class Bruksenheter(BaseModel):
    adresse: Optional[str] = None               # ADRESSE
    bolig: Optional[str] = None                 # BOLIG
    bra: Optional[str] = None                   # BRA
    bad: Optional[str] = None                   # BAD
    wc: Optional[str] = None                    # WC
    rom: Optional[str] = None                   # ROM
    type: Optional[str] = None                  # TYPE
    kjøkken: Optional[str] = None               # KJØKKEN
    eiendom: Optional[str] = None               # EIENDOM
    sist_endret: Optional[str] = None           # SIST.ENDRET

class Etasjer(BaseModel):
    etasje: Optional[str] = None                # ETASJE
    ant_boenh: Optional[str] = None             # ANT.BOENH
    bra_bolig: Optional[str] = None             # BRA.BOLIG
    bra_annet: Optional[str] = None             # BRA.ANNET
    bra_totalt: Optional[str] = None            # BRA.TOTALT
    alt_areal: Optional[str] = None             # ALT.AREAL
    alt_areal2: Optional[str] = None            # ALT.AREAL2
    bta_bolig: Optional[str] = None             # BTA.BOLIG
    bta_annet: Optional[str] = None             # BTA.ANNET
    bta_totalt: Optional[str] = None            # BTA.TOTALT

class Bygg(BaseModel):
    type: Optional[str] = None                  # TYPE
    byggningsnummer: Optional[str] = None       # BYGGNINGSNUMMER

    etasjer: Optional[list[Etasjer]] = []                       # Etasjer
    bruksenheter: Optional[list[Bruksenheter]] = []             # Bruksenheter
    vedtak: Optional[list[Vedtak]] = []                         # Vedtak
    byggningsreferanse: Optional[list[Byggningsreferanse]] = [] # Byggningsreferanse

class Forretninger(BaseModel):
    forretningstype: Optional[str] = None       # FORRETNINGSTYPE
    beskrivelse: Optional[str] = None           # BESKRIVELSE
    areal: Optional[str] = None                 # AREAL
    ref: Optional[str] = None                   # REF.
    forr_dato: Optional[str] = None             # FORR.DATO
    reg_dato: Optional[str] = None              # REG.DATO
    sakref: Optional[str] = None                # SAKREF
    andre_involverte: Optional[str] = None      # ANDRE.INVOLVERTE

class Teiger(BaseModel):
    teigid: Optional[str] = None                # TEIGID
    koordsys: Optional[str] = None              # KOORDSYS
    nord: Optional[str] = None                  # NORD
    øst: Optional[str] = None                   # ØST
    areal: Optional[str] = None                 # AREAL
    areal_merknad: Optional[str] = None         # AREAL.MERKNAD
    merknad: Optional[str] = None               # MERKNAD
    info: Optional[str] = None                  # INFO
    eiendommer: Optional[str] = None            # EIENDOMMER

class Eierforhold(BaseModel):
    fodselsnr_org: Optional[str] = None         # FØDSELSNR.ORG
    navn: Optional[str] = None                  # NAVN
    adresse: Optional[str] = None               # ADRESSE
    poststed: Optional[str] = None              # POSTSTED
    andel: Optional[str] = None                 # ANDEL
    personstatus: Optional[str] = None          # PERSONSTATUS
    rolle: Optional[str] = None                 # ROLLE
    ervervet: Optional[str] = None              # ERVERVET
    seksjon: Optional[str] = None               # SEKSJON

class Matrikkel(BaseModel):
    gnr: Optional[str] = None                   # GNR
    bnr: Optional[str] = None                   # BNR
    fnr: Optional[str] = None                   # FNR  
    snr: Optional[str] = None                   # SNR
    eiendomstype: Optional[str] = None          # EIENDOMSTYPE
    etablert: Optional[str] = None              # ETABLERT
    ber_areal: Optional[str] = None             # BER.AREAL
    hist_oppg_ar: Optional[str] = None          # HIST.OPPG.AR.
    hist_areal_kilde: Optional[str] = None      # HIST.AREAL.KILDE
    bruk_grunn: Optional[str] = None            # BRUK.GRUNN
    bruksnavn: Optional[str] = None             # BRUKSNAVN
    t_lyst: Optional[str] = None                # T.LYST

    eierforhold: list[Eierforhold] = []         # Eierforhold

    sist_oppdatert: Optional[str] = None        # SIST.OPPDATERT
    vegadresse: Optional[str] = None            # VEGADRESSE
    postnummerområde: Optional[str] = None      # POSTNUMMEROMRÅDE
    koord_kart: Optional[str] = None            # KOORD.KART

    krets_grunnkrets: Optional[str] = None          # krets_GRUNNKRETS
    krets_kirkesogn: Optional[str] = None           # krets_KIRKESOGN
    krets_postnummerområde: Optional[str] = None    # krets_POSTNUMMEROMRÅDE
    krets_skolekrets: Optional[str] = None          # krets_SKOLEKRETS
    krets_stemmekrets: Optional[str] = None         # krets_STEMMEKRETS

    teiger: list[Teiger] = []                       # teiger

    ant_teiger: Optional[str] = None                # ANT.TEIGER
    omnummerert_fra: Optional[str] = None           # OMNUMMERERT.FRA
    omnummerert_dato: Optional[str] = None          # OMNUMMERERT.DATO
    utskilt_fra: Optional[str] = None               # UTSKILT.FRA

    forretninger: Optional[list[Forretninger]] = [] # Forretninger

    bygg: Optional[list[Bygg]] = []                 # Bygg
