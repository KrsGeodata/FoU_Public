-- Add formål model and felt linkage (formål_1 + formål_2)

CREATE TABLE IF NOT EXISTS formal_kode (
    formal_1 TEXT NOT NULL,
    formal_2 TEXT NOT NULL,
    PRIMARY KEY (formal_1, formal_2)
);

CREATE INDEX IF NOT EXISTS idx_formal_kode_formal_1 ON formal_kode(formal_1);
CREATE INDEX IF NOT EXISTS idx_formal_kode_formal_1_2 ON formal_kode(formal_1, formal_2);

ALTER TABLE felt
    ADD COLUMN IF NOT EXISTS formal_1 TEXT,
    ADD COLUMN IF NOT EXISTS formal_2 TEXT;

ALTER TABLE felt
    DROP CONSTRAINT IF EXISTS fk_felt_formal_2_kode;

ALTER TABLE felt
    DROP CONSTRAINT IF EXISTS fk_felt_formal;

ALTER TABLE felt
    DROP CONSTRAINT IF EXISTS ck_felt_formal_pair;

ALTER TABLE felt
    ADD CONSTRAINT fk_felt_formal
    FOREIGN KEY (formal_1, formal_2) REFERENCES formal_kode(formal_1, formal_2)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE felt
    ADD CONSTRAINT ck_felt_formal_pair
    CHECK (
        (formal_1 IS NULL AND formal_2 IS NULL)
        OR
        (formal_1 IS NOT NULL AND formal_2 IS NOT NULL)
    );

CREATE INDEX IF NOT EXISTS idx_felt_formal_1 ON felt(planregister_id, formal_1);
CREATE INDEX IF NOT EXISTS idx_felt_formal_1_2 ON felt(formal_1, formal_2);
