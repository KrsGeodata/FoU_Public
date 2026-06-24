[matrikkel-json.json](https://github.com/user-attachments/files/25205069/matrikkel-json.json)

Dette dokumentet viser JSON-strukturen som brukes for matrikkeldata i Kristiansand Kommune. 
Felter som er merket med (`[]`) kan inneholde **flere objekter**, separert med komma.

---

## JSON-eksempel

```json
{
  "GNR": "",
  "BNR": "",
  "FNR": "",
  "SNR": "",
  "EIENDOMSTYPE": "",
  "ETABLERT": "",
  "BER.AREAL": "",
  "HIST.OPPG.AR.": "",
  "HIST.AREAL.KILDE": "",
  "BRUK.GRUNN": "",
  "BRUKSNAVN": "",
  "T.LYST": "",

  "eierforhold": [
    {
      "FØDSELSNR.ORG": "",
      "NAVN": "",
      "ADRESSE": "",
      "POSTSTED": "",
      "ANDEL": "",
      "PERSONSTATUS": "",
      "ROLLE": "",
      "ERVERVET": "",
      "SEKSJON": ""
    }
  ],

  "SIST.OPPDATERT": "",
  "VEGADRESSE": "",
  "POSTNUMMEROMRÅDE": "",
  "KOORD.KART": "",

  "krets_GRUNNKRETS": "",
  "krets_KIRKESOGN": "",
  "krets_POSTNUMMEROMRÅDE": "",
  "krets_SKOLEKRETS": "",
  "krets_STEMMEKRETS": "",

  "teiger": [
    {
      "TEIGID": "",
      "KOORDSYS": "",
      "NORD": "",
      "ØST": "",
      "AREAL": "",
      "AREAL.MERKNAD": "",
      "MERKNAD": "",
      "INFO": "",
      "EIENDOMMER": ""
    }
  ],

  "ANT.TEIGER": "",
  "OMNUMMERERT.FRA": "",
  "OMNUMMERERT.DATO": "",
  "UTSKILT.FRA": "",

  "forretninger": [
    {
      "FORRETNINGSTYPE": "",
      "BESKRIVELSE": "",
      "AREAL": "",
      "REF.": "",
      "FORR.DATO": "",
      "REG.DATO": "",
      "SAKREF": "",
      "ANDRE.INVOLVERTE": ""
    }
  ],

  "bygg": [
    {
      "TYPE": "",
      "BYGGNINGSNR": "",

      "etasjer": [
        {
          "ETASJE": "",
          "ANT.BOENH": "",
          "BRA.BOLIG": "",
          "BRA.ANNET": "",
          "BRA.TOTALT": "",
          "ALT.AREAL": "",
          "ALT.AREAL2": "",
          "BTA.BOLIG": "",
          "BTA.ANNET": "",
          "BTA.TOTALT": ""
        }
      ],

      "bruksenheter": [
        {
          "ADRESSE": "",
          "BOLIG": "",
          "BRA": "",
          "BAD": "",
          "WC": "",
          "ROM": "",
          "TYPE": "",
          "KJØKKEN": "",
          "EIENDOM": "",
          "SIST.ENDRET": ""
        }
      ],

      "vedtak": [
        {
          "STATUS": "",
          "DATO": "",
          "ÅRSAK": "",
          "REFERANSE": "",
          "REG.DATO": "",
          "SLETTET.DATO": ""
        }
      ],

      "byggningsreferanse": [
        {
          "TYPE": "",
          "REFERANSE": ""
        }
      ]
    }
  ]
}
