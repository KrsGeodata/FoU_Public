-- Seed: tema categories and titles

INSERT INTO tema_kategori (id, navn, sortering) VALUES
    (1, 'Dokumentasjon',                  1),
    (2, 'Eierform',                       2),
    (3, 'Funksjon og bruk',               3),
    (4, 'Miljøkvalitet',                  4),
    (5, 'Rekkefølge',                     5),
    (6, 'Utstrekning og formgivning',     6)
ON CONFLICT (id) DO UPDATE
SET navn = EXCLUDED.navn, sortering = EXCLUDED.sortering;

INSERT INTO tema_tittel (id, tema_kategori_id, navn, sortering) VALUES
    (1, 1, 'Dokumentasjon',              1),
    (2, 2, 'Eierform',                   1),
    (3, 3, 'Funksjon og bruk',           2),
    (4, 4, 'Energiforsyning',            1),
    (5, 4, 'Forurensning',               2),
    (6, 4, 'Skjøtsel',                   4),
    (7, 4, 'Sol/Lys',                   5),
    (8, 4, 'Støy/Luft',                 6),
    (9, 5, 'Rekkefølge',                1),
    (10, 6, 'Bygningers interne utforming', 1),
    (11, 6, 'Grad av utnytting',         2),
    (12, 6, 'Hensyn/restriksjoner',      3),
    (13, 6, 'Høyder',                    4),
    (14, 6, 'Materialbruk',              5),
    (15, 6, 'Parkering',                 6),
    (16, 6, 'Plassering/Orientering',    7),
    (17, 6, 'Teknisk infrastruktur',     8),
    (18, 6, 'Uteområder',                9),
    (19, 6, 'Volum',                     10)
ON CONFLICT (id) DO UPDATE
SET tema_kategori_id = EXCLUDED.tema_kategori_id, navn = EXCLUDED.navn, sortering = EXCLUDED.sortering;

-- Seed: tiltakstyper
INSERT INTO tiltaktype (id, navn, sortering) VALUES
    (1, 'Tilbygg, terrase eller veranda', 1),
    (2, 'Garasje, bod eller anneks', 2),
    (3, 'Enebolig, rekkehus eller leilighet', 3),
    (4, 'Utbyggingsfase', 4)
ON CONFLICT (id) DO UPDATE
SET navn = EXCLUDED.navn, sortering = EXCLUDED.sortering;

-- Seed: hensynssone types
INSERT INTO hensynssone_type (kode, navn, sortering) VALUES
    (510, 'Hensyn landbruk', 1),
    (520, 'Hensyn reindrift', 2),
    (530, 'Hensyn friluftsliv', 3),
    (540, 'Hensyn grønnstruktur', 4),
    (550, 'Hensyn landskap', 5),
    (560, 'Bevaring naturmiljø', 6),
    (570, 'Bevaring kulturmiljø', 7),
    (580, 'Randområder til nasjonalpark/landskapsvernområde', 8),
    (590, 'Hensyn for sikring av mineralressurser', 9)
ON CONFLICT (kode) DO UPDATE
SET navn = EXCLUDED.navn, sortering = EXCLUDED.sortering;
