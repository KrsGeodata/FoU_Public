-- Seed: Datafelt types (unit types - only filled by administrators, stored as metadata)
INSERT INTO datafelt_type (navn, sortering) VALUES
    ('m', 1),
    ('m2', 2),
    ('%', 3),
    ('°', 4)
ON CONFLICT (navn) DO UPDATE
SET sortering = EXCLUDED.sortering;

-- Note: tema_tittel_galeri data will be imported from the Excel file later
-- This migration creates the structure; data import will be done separately
