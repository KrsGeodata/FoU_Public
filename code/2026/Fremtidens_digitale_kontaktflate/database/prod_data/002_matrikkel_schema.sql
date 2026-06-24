SET client_encoding = 'UTF8';

-- New matrikkel table using JSONB storage.
-- Replaces the multi-table schema (eiendommer, eier, eiendommer_eier, bygninger, etasjer)
-- once the migration is complete. Created alongside for now so both can coexist during testing.

DROP TABLE IF EXISTS matrikkel_eiendommer CASCADE;

CREATE TABLE IF NOT EXISTS matrikkel_eiendommer (
    id   SERIAL,
    gnr  INTEGER NOT NULL,
    bnr  INTEGER NOT NULL,
    fnr  INTEGER NOT NULL DEFAULT 0,
    snr  INTEGER NOT NULL DEFAULT 0,
    data JSONB NOT NULL,
    PRIMARY KEY (gnr, bnr, fnr, snr)
);

CREATE INDEX IF NOT EXISTS idx_matrikkel_eiendommer_data
    ON matrikkel_eiendommer USING GIN (data);
