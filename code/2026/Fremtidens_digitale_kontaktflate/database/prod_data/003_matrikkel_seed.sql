SET client_encoding = 'UTF8';

-- Seed data for matrikkel_eiendommer table.
-- Matches existing test properties in prod_data/main_property.sql and second_property.sql.
-- JSON structure follows the Matrikkel export format.

INSERT INTO matrikkel_eiendommer (gnr, bnr, fnr, snr, data) VALUES
(
    58, 61, 0, 0,
    '{
        "GNR": 58,
        "BNR": 61,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Søm terrasse 3",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1279",
        "eierforhold": [
                {
                        "NAVN": "John Doe",
                        "PERSONNR": "11111111111",
                        "ADRESSE": "Søm terrasse 3",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Magnus Barfots vei 28",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "92849201",
                        "EPOST": "john.doe@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2015-08-18",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-10-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147639",
                        "ØST": "8.056114",
                        "AREAL": "1279"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 140 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4378,75",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.02.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "625,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "179 m2",
                        "ENHETSPRIS": "11,25",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "179 m2",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "179 m2",
                        "ENHETSPRIS": "11,25",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "179 m2",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 094 760",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265298",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "165",
                        "BRA.ANNET": "20",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "165",
                                        "BRA.ANNET": "20",
                                        "BRA.TOTALT": "185"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Søm terrasse 3",
                                        "BOLIG": "H0101",
                                        "BRA": "165"
                                }
                        ]
                }
        ]
}'
),
(
    37, 119, 0, 0,
    '{
        "GNR": 37,
        "BNR": 119,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Magnus Barfots vei 28",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1226.6",
        "eierforhold": [
                {
                        "NAVN": "Jessica Doe",
                        "PERSONNR": "22222222222",
                        "ADRESSE": "Magnus Barfots vei 28",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Magnus Barfots vei 28",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/2",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2004-01-01",
                        "TELEFON": "46849294",
                        "EPOST": "jessica.doe@example.no"
                },
                {
                        "NAVN": "John Doe",
                        "PERSONNR": "11111111111",
                        "ADRESSE": "Magnus Barfots vei 28",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Magnus Barfots vei 28",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/2",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2004-01-01",
                        "TELEFON": "92849201",
                        "EPOST": "john.doe@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Igangsettingstillatelse",
                        "DATO": "2016-10-18",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-10-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.176103",
                        "ØST": "8.045691",
                        "AREAL": "1226.6"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 240 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "5010,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "735,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "181 m³",
                        "ENHETSPRIS": "12,30",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "181 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "181 m³",
                        "ENHETSPRIS": "12,30",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "181 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 050 000",
                        "ENHETSPRIS": "1,4 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "12976526",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "261",
                        "BRA.ANNET": "34",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "178",
                                        "BRA.ANNET": "22",
                                        "BRA.TOTALT": "200"
                                },
                                {
                                        "ETASJE": "2",
                                        "ANT.BOENH": "0",
                                        "BRA.BOLIG": "83",
                                        "BRA.ANNET": "12",
                                        "BRA.TOTALT": "95"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Magnus Barfots vei 28",
                                        "BOLIG": "H0101",
                                        "BRA": "178"
                                }
                        ]
                },
                {
                        "TYPE": "Garasje",
                        "BYGGNINGSNR": "21337986",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Ikke tilknyttet",
                        "AVLØP": "Ikke tilknyttet",
                        "BRA.BOLIG": "0",
                        "BRA.ANNET": "42",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "0",
                                        "BRA.BOLIG": "0",
                                        "BRA.ANNET": "42",
                                        "BRA.TOTALT": "42"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Magnus Barfots vei 28",
                                        "BOLIG": "G0101",
                                        "BRA": "42"
                                }
                        ]
                }
        ]
}'
),

(
    17, 34, 0, 0,
    '{
        "GNR": 17,
        "BNR": 34,
        "FNR": 0,
        "SNR": 0,
        "KOMMUNENR": "3439",
        "AVFALLSOR_ID": "",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Holtesetervegen 35",
        "POSTNUMMEROMRÅDE": "2632 VENABYGD",
        "BER.AREAL": "1463.4",
        "eierforhold": [
                {
                        "NAVN": "John Doe",
                        "PERSONNR": "11111111111",
                        "ADRESSE": "Holtesetervegen 35",
                        "POSTSTED": "2632 VENABYGD",
                        "BOSTEDADRESSE": "Magnus Barfots vei 28",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2010-01-15",
                        "TELEFON": "92849201",
                        "EPOST": "john.doe@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Ferdigattest",
                        "DATO": "2016-11-01",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-11-02",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "61.640638",
                        "ØST": "10.084715",
                        "AREAL": "1463.4"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Fritidsbygg",
                        "BYGGNINGSNR": "156582840",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Ikke tilknyttet",
                        "AVLØP": "Ikke tilknyttet",
                        "BRA.BOLIG": "95",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "95",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "95"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Holtesetervegen 35",
                                        "BOLIG": "H0101",
                                        "BRA": "95"
                                }
                        ]
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 80 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "3200,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "266,67",
                        "ÅRSBELØP": "3200,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "500,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "41,67",
                        "ÅRSBELØP": "500,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "40 m³",
                        "ENHETSPRIS": "10,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "0,00",
                        "ÅRSBELØP": "0,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "40 m³",
                        "ENHETSPRIS": "13,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "0,00",
                        "ÅRSBELØP": "0,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "40 m³",
                        "ENHETSPRIS": "10,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "0,00",
                        "ÅRSBELØP": "0,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "40 m³",
                        "ENHETSPRIS": "13,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "0,00",
                        "ÅRSBELØP": "0,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "650 000",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "81,25",
                        "ÅRSBELØP": "975,00",
                        "TYPE": "Løpende"
                }
        ]
}'
),


(
    58, 60, 0, 0,
    '{
        "GNR": 58,
        "BNR": 60,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Søm terrase 1",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1150",
        "eierforhold": [
                {
                        "NAVN": "Ola Normann",
                        "PERSONNR": "33333333333",
                        "ADRESSE": "Søm terrase 1",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Søm terrase 1",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "46345677",
                        "EPOST": "olaNor@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2018-03-12",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2018-03-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147907",
                        "ØST": "8.056148",
                        "AREAL": "1150"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 80 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4070,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "630,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "199 m³",
                        "ENHETSPRIS": "11,40",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "199 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "199 m³",
                        "ENHETSPRIS": "11,40",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "199 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "950 000",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265255",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "120",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "120",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "120"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Søm terrase 1",
                                        "BOLIG": "H0101",
                                        "BRA": "120"
                                }
                        ]
                }
        ]
}'
),
(
    58, 62, 0, 0,
    '{
        "GNR": 58,
        "BNR": 62,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Søm terrase 5",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1186.9",
        "eierforhold": [
                {
                        "NAVN": "Peder Pedersen",
                        "PERSONNR": "44444444444",
                        "ADRESSE": "Søm terrase 5",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Søm terrase 5",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "98123456",
                        "EPOST": "peder.pedersen@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Igangsettingstillatelse",
                        "DATO": "2019-06-25",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2019-06-27",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147398",
                        "ØST": "8.056214",
                        "AREAL": "1186.9"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 140 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4610,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "700,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "201 m³",
                        "ENHETSPRIS": "12,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "201 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "201 m³",
                        "ENHETSPRIS": "12,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "201 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 050 000",
                        "ENHETSPRIS": "1,4 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265344",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "100",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "100",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "100"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Søm terrase 5",
                                        "BOLIG": "H0101",
                                        "BRA": "100"
                                }
                        ]
                }
        ]
}'
),
(
    58, 69, 0, 0,
    '{
        "GNR": 58,
        "BNR": 69,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Vardåsveien 112",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1142.9",
        "eierforhold": [
                {
                        "NAVN": "Ola Askeladd",
                        "PERSONNR": "55555555555",
                        "ADRESSE": "Vardåsveien 112",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Vardåsveien 112",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "92123456",
                        "EPOST": "ola.askeladd@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Ferdigattest",
                        "DATO": "2020-09-14",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2020-09-16",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147629",
                        "ØST": "8.056859",
                        "AREAL": "1142.9"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 240 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4710,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "700,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "12,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "12,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "950 000",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265328",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "267",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "267",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "267"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Vardåsveien 112",
                                        "BOLIG": "H0101",
                                        "BRA": "267"
                                }
                        ]
                }
        ]
}'
),
(
    58, 52, 0, 0,
    '{
        "GNR": 58,
        "BNR": 52,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Søm terrase 6",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1036",
        "eierforhold": [
                {
                        "NAVN": "Jenny Jensen",
                        "PERSONNR": "66666666666",
                        "ADRESSE": "Søm terrase 6",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Søm terrase 6",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "97721783",
                        "EPOST": "jenny.jensen@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2021-04-07",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2021-04-12",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147744",
                        "ØST": "8.055503",
                        "AREAL": "1036"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 140 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4460,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "595,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "191 m³",
                        "ENHETSPRIS": "11,10",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "191 m³",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "191 m³",
                        "ENHETSPRIS": "11,10",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "191 m³",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 000 000",
                        "ENHETSPRIS": "1,6 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265271",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "140",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "140",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "140"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Søm terrase 6",
                                        "BOLIG": "H0101",
                                        "BRA": "140"
                                }
                        ]
                }
        ]
}'
),
(
    58, 53, 0, 0,
    '{
        "GNR": 58,
        "BNR": 53,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Søm terrase 8",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1242.8",
        "eierforhold": [
                {
                        "NAVN": "Bodil Ruud",
                        "PERSONNR": "77777777777",
                        "ADRESSE": "Søm terrase 8",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Søm terrase 8",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "97721799",
                        "EPOST": "bodil.ruud@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Igangsettingstillatelse",
                        "DATO": "2022-02-10",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2022-02-15",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147505",
                        "ØST": "8.055451",
                        "AREAL": "1242.8"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 180 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4770,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "630,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "192 m³",
                        "ENHETSPRIS": "11,40",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "192 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "192 m³",
                        "ENHETSPRIS": "11,40",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "192 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 050 000",
                        "ENHETSPRIS": "1,4 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265336",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "198",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "198",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "198"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Søm terrase 8",
                                        "BOLIG": "H0101",
                                        "BRA": "198"
                                }
                        ]
                }
        ]
}'
),
(
    58, 68, 0, 0,
    '{
        "GNR": 58,
        "BNR": 68,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Vardåsveien 114",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1062.9",
        "eierforhold": [
                {
                        "NAVN": "Jens Kydland",
                        "PERSONNR": "88888888888",
                        "ADRESSE": "Vardåsveien 114",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Vardåsveien 114",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "96783457",
                        "EPOST": "jens.kydland@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2015-08-18",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-10-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147411",
                        "ØST": "8.056902",
                        "AREAL": "1062.9"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 180 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4320,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "665,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "11,70",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "14,80",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "11,70",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "14,80",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "900 000",
                        "ENHETSPRIS": "1,4 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265352",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "285",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "285",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "285"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Vardåsveien 114",
                                        "BOLIG": "H0101",
                                        "BRA": "285"
                                }
                        ]
                }
        ]
}'
),
(
    58, 70, 0, 0,
    '{
        "GNR": 58,
        "BNR": 70,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "ab3d2361-074e-4b83-ae1b-63d7c369bbc6",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Sømskleiva 26",
        "POSTNUMMEROMRÅDE": "4637 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "956.7",
        "eierforhold": [
                {
                        "NAVN": "Simen Stokka",
                        "PERSONNR": "99999999999",
                        "ADRESSE": "Sømskleiva 26",
                        "POSTSTED": "4637 Kristiansand",
                        "BOSTEDADRESSE": "Sømskleiva 26",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "96767458",
                        "EPOST": "simen.stokka@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Igangsettingstillatelse",
                        "DATO": "2016-10-18",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-10-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.147853",
                        "ØST": "8.056932",
                        "AREAL": "956.7"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 80 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4220,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "735,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "209 m³",
                        "ENHETSPRIS": "12,30",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "209 m³",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "209 m³",
                        "ENHETSPRIS": "12,30",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "209 m³",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 000 000",
                        "ENHETSPRIS": "1,6 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168265018",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "222",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "222",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "222"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Sømskleiva 26",
                                        "BOLIG": "H0101",
                                        "BRA": "222"
                                }
                        ]
                }
        ]
}'
),
(
    37, 106, 0, 0,
    '{
        "GNR": 37,
        "BNR": 106,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Magnus Barfots vei 26",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "1398.9",
        "eierforhold": [
                {
                        "NAVN": "Anders Lunde",
                        "PERSONNR": "10101010101",
                        "ADRESSE": "Magnus Barfots vei 26",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Magnus Barfots vei 26",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "91827364",
                        "EPOST": "anders.lunde@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Ferdigattest",
                        "DATO": "2016-11-01",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-11-02",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.17604095",
                        "ØST": "8.04505161",
                        "AREAL": "1398.9"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 120 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "5280,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "770,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "168 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "168 m³",
                        "ENHETSPRIS": "17,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "168 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "168 m³",
                        "ENHETSPRIS": "17,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 300 000",
                        "ENHETSPRIS": "1,6 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168283814",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "220",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "220",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "220"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Magnus Barfots vei 26",
                                        "BOLIG": "H0101",
                                        "BRA": "220"
                                }
                        ]
                }
        ]
}'
),
(
    37, 120, 0, 0,
    '{
        "GNR": 37,
        "BNR": 120,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Magnus Barfots vei 30",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "991.5",
        "eierforhold": [
                {
                        "NAVN": "Silje Karlsen",
                        "PERSONNR": "12121212121",
                        "ADRESSE": "Magnus Barfots vei 30",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Magnus Barfots vei 30",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "93214567",
                        "EPOST": "silje.karlsen@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2018-03-12",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2018-03-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.17634076",
                        "ØST": "8.04598469",
                        "AREAL": "991.5"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 80 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4520,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "770,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "182 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "182 m³",
                        "ENHETSPRIS": "16,20",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "182 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "182 m³",
                        "ENHETSPRIS": "16,20",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 100 000",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "168284950",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "108",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "108",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "108"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Magnus Barfots vei 30",
                                        "BOLIG": "H0101",
                                        "BRA": "108"
                                }
                        ]
                }
        ]
}'
),
(
    37, 390, 0, 0,
    '{
        "GNR": 37,
        "BNR": 390,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Hestnestangen 9",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "841.8",
        "eierforhold": [
                {
                        "NAVN": "Martin Ødegård",
                        "PERSONNR": "13131313131",
                        "ADRESSE": "Hestnestangen 9",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Hestnestangen 9",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "94785621",
                        "EPOST": "martin.odegard@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Igangsettingstillatelse",
                        "DATO": "2019-06-25",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2019-06-27",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.17575866",
                        "ØST": "8.04546707",
                        "AREAL": "841.8"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 80 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4520,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "665,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "11,70",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "16,20",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "11,70",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "208 m³",
                        "ENHETSPRIS": "16,20",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 100 000",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "12981201",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "240",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "240",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "240"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Hestnestangen 9",
                                        "BOLIG": "H0101",
                                        "BRA": "240"
                                }
                        ]
                }
        ]
}'
),
(
    37, 380, 0, 0,
    '{
        "GNR": 37,
        "BNR": 380,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Hestnestangen 11",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "681.6",
        "eierforhold": [
                {
                        "NAVN": "Nora Bakke",
                        "PERSONNR": "14141414141",
                        "ADRESSE": "Hestnestangen 11",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Hestnestangen 11",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "96587432",
                        "EPOST": "nora.bakke@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Ferdigattest",
                        "DATO": "2020-09-14",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2020-09-16",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.17580910",
                        "ØST": "8.04599483",
                        "AREAL": "681.6"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 80 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4370,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "560,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "198 m³",
                        "ENHETSPRIS": "10,80",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "198 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "198 m³",
                        "ENHETSPRIS": "10,80",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "198 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 050 000",
                        "ENHETSPRIS": "1,4 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "12975325",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "145",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "145",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "145"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Hestnestangen 11",
                                        "BOLIG": "H0101",
                                        "BRA": "145"
                                }
                        ]
                }
        ]
}'
),
(
    37, 414, 0, 0,
    '{
        "GNR": 37,
        "BNR": 414,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Magnus Barfots vei 32",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "206.6",
        "eierforhold": [
                {
                        "NAVN": "Bror Johnsen",
                        "PERSONNR": "15151515151",
                        "ADRESSE": "Magnus Barfots vei 32",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Magnus Barfots vei 32",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "96587643",
                        "EPOST": "bror.johnsen@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2021-04-07",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2021-04-12",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.17641884",
                        "ØST": "8.04570072",
                        "AREAL": "206.6"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 240 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4710,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "770,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "171 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "171 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "171 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "171 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "950 000",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "21319724",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "125",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "125",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "125"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Magnus Barfots vei 32",
                                        "BOLIG": "H0101",
                                        "BRA": "125"
                                }
                        ]
                }
        ]
}'
),
(
    37, 415, 0, 0,
    '{
        "GNR": 37,
        "BNR": 415,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Magnus Barfots vei 34",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "313.7",
        "eierforhold": [
                {
                        "NAVN": "Henrik Hveten",
                        "PERSONNR": "16161616161",
                        "ADRESSE": "Magnus Barfots vei 34",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Magnus Barfots vei 34",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "96587643",
                        "EPOST": "henrik.hveten@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Igangsettingstillatelse",
                        "DATO": "2022-02-10",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2022-02-15",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.17652067",
                        "ØST": "8.04577814",
                        "AREAL": "313.7"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 80 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4220,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "560,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "172 m³",
                        "ENHETSPRIS": "10,80",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "172 m³",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "172 m³",
                        "ENHETSPRIS": "10,80",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "172 m³",
                        "ENHETSPRIS": "15,50",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 000 000",
                        "ENHETSPRIS": "1,6 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "21319732",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "150",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "150",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "150"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Magnus Barfots vei 34",
                                        "BOLIG": "H0101",
                                        "BRA": "150"
                                }
                        ]
                }
        ]
}'
),
(
    37, 389, 0, 0,
    '{
        "GNR": 37,
        "BNR": 389,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "a624aac2-8c77-4d1f-aaa1-5255c049c191",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Hestnestangen 7",
        "POSTNUMMEROMRÅDE": "4633 Kristiansand",
        "KOMMUNENR": "4204",
        "BER.AREAL": "847.5",
        "eierforhold": [
                {
                        "NAVN": "Ingrid Rustad",
                        "PERSONNR": "17171717171",
                        "ADRESSE": "Hestnestangen 7",
                        "POSTSTED": "4633 Kristiansand",
                        "BOSTEDADRESSE": "Hestnestangen 7",
                        "BOSTEDKOMMUNENR": "4204",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "2000-01-01",
                        "TELEFON": "96586767",
                        "EPOST": "ingrid.rustad@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2015-08-18",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-10-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.17580708",
                        "ØST": "8.04503643",
                        "AREAL": "847.5"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 240 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "5010,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "630,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "11,40",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "11,40",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "207 m³",
                        "ENHETSPRIS": "15,85",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 050 000",
                        "ENHETSPRIS": "1,4 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "12984723",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "250",
                        "BRA.ANNET": "0",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "250",
                                        "BRA.ANNET": "0",
                                        "BRA.TOTALT": "250"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Hestnestangen 7",
                                        "BOLIG": "H0101",
                                        "BRA": "250"
                                }
                        ]
                }
        ]
}'
)
,
(
    152, 452, 0, 0,
    '{
        "GNR": 152,
        "BNR": 452,
        "FNR": 0,
        "SNR": 0,
        "AVFALLSOR_ID": "c9eb4e9b-821a-40c0-b5eb-636b25f0c5d9",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Industrigata 24",
        "POSTNUMMEROMRÅDE": "4632 Kristiansand S",
        "KOMMUNENR": "4204",
        "BER.AREAL": "960.6",
        "eierforhold": [
                {
                        "TYPE": "ORG",
                        "NAVN": "Just Dough It AS",
                        "ORGNR": "999888777",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "REPRESENTANTER": [
                                {
                                        "PERSONNR": "11111111111",
                                        "NAVN": "John Doe"
                                }
                        ]
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Igangsettingstillatelse",
                        "DATO": "2016-10-18",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-10-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "58.154675",
                        "ØST": "8.025672",
                        "AREAL": "960.6"
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 140 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4310,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "364,90",
                        "ÅRSBELØP": "4378,75",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "770,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "52,08",
                        "ÅRSBELØP": "625,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "163 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "163 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "163 m³",
                        "ENHETSPRIS": "12,60",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "503,44",
                        "ÅRSBELØP": "6041,25",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "163 m³",
                        "ENHETSPRIS": "15,15",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "693,54",
                        "ÅRSBELØP": "8330,50",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "950 000",
                        "ENHETSPRIS": "1,5 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "136,83",
                        "ÅRSBELØP": "1642,00",
                        "TYPE": "Løpende"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Næringsbygg",
                        "BYGGNINGSNR": "8922772",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "0",
                        "BRA.ANNET": "960.6",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "0",
                                        "BRA.BOLIG": "0",
                                        "BRA.ANNET": "960.6",
                                        "BRA.TOTALT": "960.6"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Industrigata 24",
                                        "BOLIG": "N0101",
                                        "BRA": "960.6"
                                }
                        ]
                }
        ]
}'
),
(
    33, 865, 0, 0,
    '{
        "GNR": 33,
        "BNR": 865,
        "FNR": 0,
        "SNR": 0,
        "KOMMUNENR": "0301",
        "AVFALLSOR_ID": "",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Doktor Holms vei 10",
        "POSTNUMMEROMRÅDE": "0787 OSLO",
        "BER.AREAL": "2656",
        "eierforhold": [
            {
                "NAVN": "Maximilian Amadeus Lorengren",
                "PERSONNR": "12345678910",
                "ADRESSE": "Doktor Holms vei 10",
                "POSTSTED": "0787 OSLO",
                "BOSTEDADRESSE": "Doktor Holms vei 10",
                "BOSTEDKOMMUNENR": "0301",
                "ANDEL": "1/1",
                "ROLLE": "Hjemmelshaver",
                "ERVERVET": "2015-05-12",
                "TELEFON": "91723344",
                "EPOST": "maximilian.lorengren@example.no"
            }
        ],
        "vedtak": [
                {
                        "STATUS": "Ferdigattest",
                        "DATO": "2016-11-01",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2016-11-02",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
            {
                "NORD": "59.960348",
                "ØST": "10.675997",
                "AREAL": "2656"
            }
        ],
        "bygg": [
            {
                "TYPE": "Enebolig",
                "BYGGNINGSNR": "80712243",
                "STATUS": "Ferdigattest",
                "VANNFORSYNING": "Offentlig vannverk",
                "AVLØP": "Offentlig avløp",
                "BRA.BOLIG": "185",
                "BRA.ANNET": "25",
                "etasjer": [
                    {
                        "ETASJE": "1",
                        "ANT.BOENH": "1",
                        "BRA.BOLIG": "110",
                        "BRA.ANNET": "10",
                        "BRA.TOTALT": "120"
                    },
                    {
                        "ETASJE": "2",
                        "ANT.BOENH": "0",
                        "BRA.BOLIG": "75",
                        "BRA.ANNET": "15",
                        "BRA.TOTALT": "90"
                    }
                ],
                "bruksenheter": [
                    {
                        "ADRESSE": "Doktor Holms vei 10",
                        "BOLIG": "H0101",
                        "BRA": "185"
                    }
                ]
            },
            {
                "TYPE": "Garasjeuthus anneks til bolig",
                "BYGGNINGSNR": "81772622",
                "STATUS": "Ferdigattest",
                "VANNFORSYNING": "Ikke tilknyttet",
                "AVLØP": "Ikke tilknyttet",
                "BRA.BOLIG": "0",
                "BRA.ANNET": "48",
                "etasjer": [
                    {
                        "ETASJE": "1",
                        "ANT.BOENH": "0",
                        "BRA.BOLIG": "0",
                        "BRA.ANNET": "48",
                        "BRA.TOTALT": "48"
                    }
                ],
                "bruksenheter": [
                    {
                        "ADRESSE": "Doktor Holms vei 10",
                        "BOLIG": "G0101",
                        "BRA": "48"
                    }
                ]
            }
        ],
        "gjeldende_gebyrer": [
            {
                "GEBYR": "Restavfall 140 liter",
                "GRUNNLAG": "1 stk",
                "ENHETSPRIS": "4500,00",
                "ANDEL": "1/1",
                "KORR": "0 %",
                "FRA_DATO": "01.01.2026",
                "TIL_DATO": "",
                "BELØP": "375,00",
                "ÅRSBELØP": "4500,00",
                "TYPE": "Løpende"
            },
            {
                "GEBYR": "Feie- og tilsynsgebyr",
                "GRUNNLAG": "1 stk",
                "ENHETSPRIS": "650,00",
                "ANDEL": "1/1",
                "KORR": "0 %",
                "FRA_DATO": "01.01.2026",
                "TIL_DATO": "",
                "BELØP": "54,17",
                "ÅRSBELØP": "650,00",
                "TYPE": "Løpende"
            },
            {
                "GEBYR": "Fast gebyr vann",
                "GRUNNLAG": "190 m³",
                "ENHETSPRIS": "12,00",
                "ANDEL": "1/1",
                "KORR": "0 %",
                "FRA_DATO": "01.01.2026",
                "TIL_DATO": "",
                "BELØP": "190,00",
                "ÅRSBELØP": "2280,00",
                "TYPE": "Løpende"
            },
            {
                "GEBYR": "Fast gebyr avløp",
                "GRUNNLAG": "190 m³",
                "ENHETSPRIS": "16,00",
                "ANDEL": "1/1",
                "KORR": "0 %",
                "FRA_DATO": "01.01.2026",
                "TIL_DATO": "",
                "BELØP": "253,33",
                "ÅRSBELØP": "3040,00",
                "TYPE": "Løpende"
            },
            {
                "GEBYR": "A-konto vann",
                "GRUNNLAG": "190 m³",
                "ENHETSPRIS": "12,00",
                "ANDEL": "1/1",
                "KORR": "0 %",
                "FRA_DATO": "01.01.2026",
                "TIL_DATO": "",
                "BELØP": "190,00",
                "ÅRSBELØP": "2280,00",
                "TYPE": "Løpende"
            },
            {
                "GEBYR": "A-konto avløp",
                "GRUNNLAG": "190 m³",
                "ENHETSPRIS": "16,00",
                "ANDEL": "1/1",
                "KORR": "0 %",
                "FRA_DATO": "01.01.2026",
                "TIL_DATO": "",
                "BELØP": "253,33",
                "ÅRSBELØP": "3040,00",
                "TYPE": "Løpende"
            },
            {
                "GEBYR": "Eiendomsskatt",
                "GRUNNLAG": "1 980 000",
                "ENHETSPRIS": "1,6 o/oo",
                "ANDEL": "1/1",
                "KORR": "0 %",
                "FRA_DATO": "01.01.2026",
                "TIL_DATO": "",
                "BELØP": "264,00",
                "ÅRSBELØP": "3168,00",
                "TYPE": "Løpende"
            }
        ]
    }'
),

(
    17, 239, 0, 0,
    '{
        "GNR": 17,
        "BNR": 239,
        "FNR": 0,
        "SNR": 0,
        "KOMMUNENR": "3240",
        "AVFALLSOR_ID": "",
        "EIENDOMSTYPE": "Grunneiendom",
        "VEGADRESSE": "Kastellet 13",
        "POSTNUMMEROMRÅDE": "2080 EIDSVOLL",
        "BER.AREAL": "1635.1",
        "eierforhold": [
                {
                        "NAVN": "Kristian Falsen",
                        "PERSONNR": "10987654321",
                        "ADRESSE": "Kastellet 13",
                        "POSTSTED": "2080 EIDSVOLL",
                        "BOSTEDADRESSE": "Kastellet 13",
                        "BOSTEDKOMMUNENR": "3240",
                        "ANDEL": "1/1",
                        "ROLLE": "Hjemmelshaver",
                        "ERVERVET": "1973-05-12",
                        "TELEFON": "91171819",
                        "EPOST": "kristian.falsen@example.no"
                }
        ],
        "vedtak": [
                {
                        "STATUS": "Rammetillatelse",
                        "DATO": "2018-03-12",
                        "ÅRSAK": "",
                        "REFERANSE": "",
                        "REG.DATO": "2018-03-20",
                        "SLETTET.DATO": null
                }
        ],
        "teiger": [
                {
                        "NORD": "60.323665",
                        "ØST": "11.271341",
                        "AREAL": "1635.1"
                }
        ],
        "bygg": [
                {
                        "TYPE": "Enebolig",
                        "BYGGNINGSNR": "151654959",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Offentlig vannverk",
                        "AVLØP": "Offentlig avløp",
                        "BRA.BOLIG": "185",
                        "BRA.ANNET": "25",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "1",
                                        "BRA.BOLIG": "110",
                                        "BRA.ANNET": "10",
                                        "BRA.TOTALT": "120"
                                },
                                {
                                        "ETASJE": "2",
                                        "ANT.BOENH": "0",
                                        "BRA.BOLIG": "75",
                                        "BRA.ANNET": "15",
                                        "BRA.TOTALT": "90"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Kastellet 13",
                                        "BOLIG": "H0101",
                                        "BRA": "185"
                                }
                        ]
                },
                {
                        "TYPE": "Garasjeuthus anneks til bolig",
                        "BYGGNINGSNR": "15264470",
                        "STATUS": "Tatt i bruk",
                        "VANNFORSYNING": "Ikke tilknyttet",
                        "AVLØP": "Ikke tilknyttet",
                        "BRA.BOLIG": "0",
                        "BRA.ANNET": "48",
                        "etasjer": [
                                {
                                        "ETASJE": "1",
                                        "ANT.BOENH": "0",
                                        "BRA.BOLIG": "0",
                                        "BRA.ANNET": "48",
                                        "BRA.TOTALT": "48"
                                }
                        ],
                        "bruksenheter": [
                                {
                                        "ADRESSE": "Kastellet 13",
                                        "BOLIG": "G0101",
                                        "BRA": "48"
                                }
                        ]
                }
        ],
        "gjeldende_gebyrer": [
                {
                        "GEBYR": "Restavfall 140 liter",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "4500,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "375,00",
                        "ÅRSBELØP": "4500,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Feie- og tilsynsgebyr",
                        "GRUNNLAG": "1 stk",
                        "ENHETSPRIS": "650,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "54,17",
                        "ÅRSBELØP": "650,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr vann",
                        "GRUNNLAG": "190 m³",
                        "ENHETSPRIS": "12,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "190,00",
                        "ÅRSBELØP": "2280,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Fast gebyr avløp",
                        "GRUNNLAG": "190 m³",
                        "ENHETSPRIS": "16,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "253,33",
                        "ÅRSBELØP": "3040,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto vann",
                        "GRUNNLAG": "190 m³",
                        "ENHETSPRIS": "12,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "190,00",
                        "ÅRSBELØP": "2280,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "A-konto avløp",
                        "GRUNNLAG": "190 m³",
                        "ENHETSPRIS": "16,00",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "253,33",
                        "ÅRSBELØP": "3040,00",
                        "TYPE": "Løpende"
                },
                {
                        "GEBYR": "Eiendomsskatt",
                        "GRUNNLAG": "1 980 000",
                        "ENHETSPRIS": "1,6 o/oo",
                        "ANDEL": "1/1",
                        "KORR": "0 %",
                        "FRA_DATO": "01.01.2026",
                        "TIL_DATO": "",
                        "BELØP": "264,00",
                        "ÅRSBELØP": "3168,00",
                        "TYPE": "Løpende"
                }
        ]
}'
),

-- Test case with minimal data, only fields needed for "naboliste"
-- Eidsvoll
(
17, 238, 0, 0,
'{
        "GNR": 17,
        "BNR": 238,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Kastellet 11",
        "POSTNUMMEROMRÅDE": "2080 Eidsvoll",
        "KOMMUNENR": "3240",
        "eierforhold": [
                {
                        "NAVN": "Berit Holmsen",
                        "ADRESSE": "Kastellet 11",
                        "POSTSTED": "2080 Eidsvoll",
                        "BOSTEDADRESSE": "Kastellet 11",
                        "BOSTEDKOMMUNENR": "3240",
                        "TELEFON": "92840909",
                        "EPOST": "berit.holmsen@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "60.32349",
                        "ØST": "11.27179"
                }
        ]
}'
),


(
17, 69, 0, 0,
'{
        "GNR": 17,
        "BNR": 69,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Kastellet 14",
        "POSTNUMMEROMRÅDE": "2080 EIDSVOLL",
        "KOMMUNENR": "3240",
        "eierforhold": [
                {
                        "NAVN": "Kaare Olsen",
                        "ADRESSE": "Kastellet 14",
                        "POSTSTED": "2080 EIDSVOLL",
                        "BOSTEDADRESSE": "Kastellet 14",
                        "BOSTEDKOMMUNENR": "3240",
                        "TELEFON": "90112233",
                        "EPOST": "kaare.olsen@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "60.323926",
                        "ØST": "11.270359"
                }
        ]
}'
),


(
17, 237, 0, 0,
'{
        "GNR": 17,
        "BNR": 237,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Kastellet 9",
        "POSTNUMMEROMRÅDE": "2080 EIDSVOLL",
        "KOMMUNENR": "3240",
        "eierforhold": [
                {
                        "NAVN": "Lars Johansen",
                        "ADRESSE": "Kastellet 9",
                        "POSTSTED": "2080 EIDSVOLL",
                        "BOSTEDADRESSE": "Kastellet 9",
                        "BOSTEDKOMMUNENR": "3240",
                        "TELEFON": "98654321",
                        "EPOST": "lars.johansen@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "60.323279",
                        "ØST": "11.272327"
                }
        ]
}'
),


(
17, 362, 0, 0,
'{
        "GNR": 17,
        "BNR": 362,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Kastellkroken 33",
        "POSTNUMMEROMRÅDE": "2080 EIDSVOLL",
        "KOMMUNENR": "3240",
        "eierforhold": [
                {
                        "NAVN": "Heidi Berg",
                        "ADRESSE": "Kastellkroken 33",
                        "POSTSTED": "2080 EIDSVOLL",
                        "BOSTEDADRESSE": "Kastellkroken 33",
                        "BOSTEDKOMMUNENR": "3240",
                        "TELEFON": "95432109",
                        "EPOST": "heidi.berg@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "60.323542",
                        "ØST": "11.272406"
                }
        ]
}'
),


(
17, 357, 0, 0,
'{
        "GNR": 17,
        "BNR": 357,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Kastellkroken 25",
        "POSTNUMMEROMRÅDE": "2080 EIDSVOLL",
        "KOMMUNENR": "3240",
        "eierforhold": [
                {
                        "NAVN": "Trine Solberg",
                        "ADRESSE": "Kastellkroken 25",
                        "POSTSTED": "2080 EIDSVOLL",
                        "BOSTEDADRESSE": "Kastellkroken 25",
                        "BOSTEDKOMMUNENR": "3240",
                        "TELEFON": "93456789",
                        "EPOST": "trine.solberg@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "60.323955",
                        "ØST": "11.271416"
                }
        ]
}'
),


(
17, 379, 0, 0,
'{
        "GNR": 17,
        "BNR": 379,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Kastellkroken 27",
        "POSTNUMMEROMRÅDE": "2080 EIDSVOLL",
        "KOMMUNENR": "3240",
        "eierforhold": [
                {
                        "NAVN": "Mona Lunde",
                        "ADRESSE": "Kastellkroken 27",
                        "POSTSTED": "2080 EIDSVOLL",
                        "BOSTEDADRESSE": "Kastellkroken 27",
                        "BOSTEDKOMMUNENR": "3240",
                        "TELEFON": "91234567",
                        "EPOST": "mona.lunde@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "60.323910",
                        "ØST": "11.271730"
                }
        ]
}'
),


(
17, 358, 0, 0,
'{
        "GNR": 17,
        "BNR": 358,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Kastellkroken 29",
        "POSTNUMMEROMRÅDE": "2080 EIDSVOLL",
        "KOMMUNENR": "3240",
        "eierforhold": [
                {
                        "NAVN": "Per Andersen",
                        "ADRESSE": "Kastellkroken 29",
                        "POSTSTED": "2080 EIDSVOLL",
                        "BOSTEDADRESSE": "Kastellkroken 29",
                        "BOSTEDKOMMUNENR": "3240",
                        "TELEFON": "98765432",
                        "EPOST": "per.andersen@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "60.323828",
                        "ØST": "11.272011"
                }
        ]
}'
),

-- Test case with minimal data, only fields needed for "naboliste"
-- Oslo
(
33, 2441, 0, 0,
'{
        "GNR": 33,
        "BNR": 2441,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Doktor Holms vei 12A",
        "POSTNUMMEROMRÅDE": "0787 OSLO",
        "KOMMUNENR": "0301",
        "eierforhold": [
                {
                        "NAVN": "Nora Lund",
                        "ADRESSE": "Doktor Holms vei 12A",
                        "POSTSTED": "0787 OSLO",
                        "BOSTEDADRESSE": "Doktor Holms vei 12A",
                        "BOSTEDKOMMUNENR": "0301",
                        "TELEFON": "92233445",
                        "EPOST": "nora.lund@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "59.960214",
                        "ØST": "10.675459"
                }
        ]
}'
),


(
33, 10, 0, 0,
'{
        "GNR": 33,
        "BNR": 10,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Doktor Holms vei 12B",
        "POSTNUMMEROMRÅDE": "0787 OSLO",
        "KOMMUNENR": "0301",
        "eierforhold": [
                {
                        "NAVN": "Erik Vik",
                        "ADRESSE": "Doktor Holms vei 12B",
                        "POSTSTED": "0787 OSLO",
                        "BOSTEDADRESSE": "Doktor Holms vei 12B",
                        "BOSTEDKOMMUNENR": "0301",
                        "TELEFON": "93011223",
                        "EPOST": "erik.vik@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "59.960104",
                        "ØST": "10.674863"
                }
        ]
}'
),


(
33, 1799, 0, 0,
'{
        "GNR": 33,
        "BNR": 1799,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Doktor Holms vei 6E",
        "POSTNUMMEROMRÅDE": "0787 OSLO",
        "KOMMUNENR": "0301",
        "eierforhold": [
                {
                        "NAVN": "Silje Moen",
                        "ADRESSE": "Doktor Holms vei 6E",
                        "POSTSTED": "0787 OSLO",
                        "BOSTEDADRESSE": "Doktor Holms vei 6E",
                        "BOSTEDKOMMUNENR": "0301",
                        "TELEFON": "94455667",
                        "EPOST": "silje.moen@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "59.959992",
                        "ØST": "10.675829"
                }
        ]
}'
),


(
33, 71, 0, 0,
'{
        "GNR": 33,
        "BNR": 71,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Doktor Holms vei 5",
        "POSTNUMMEROMRÅDE": "0787 OSLO",
        "KOMMUNENR": "0301",
        "eierforhold": [
                {
                        "NAVN": "Thomas Dahl",
                        "ADRESSE": "Doktor Holms vei 5",
                        "POSTSTED": "0787 OSLO",
                        "BOSTEDADRESSE": "Doktor Holms vei 5",
                        "BOSTEDKOMMUNENR": "0301",
                        "TELEFON": "95778899",
                        "EPOST": "thomas.dahl@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "59.960305",
                        "ØST": "10.676864"
                }
        ]
}'
),


(
33, 14, 0, 0,
'{
        "GNR": 33,
        "BNR": 14,
        "FNR": 0,
        "SNR": 0,
        "VEGADRESSE": "Doktor Holms vei 8B",
        "POSTNUMMEROMRÅDE": "0787 OSLO",
        "KOMMUNENR": "0301",
        "eierforhold": [
                {
                        "NAVN": "Marte Sunde",
                        "ADRESSE": "Doktor Holms vei 8B",
                        "POSTSTED": "0787 OSLO",
                        "BOSTEDADRESSE": "Doktor Holms vei 8B",
                        "BOSTEDKOMMUNENR": "0301",
                        "TELEFON": "94887766",
                        "EPOST": "marte.sunde@example.no"
                }
        ],
        "teiger": [
                {
                        "NORD": "59.960728",
                        "ØST": "10.676324"
                }
        ]
}'
);
