-- Initial schema: plans, fields, plots, regulations

CREATE TABLE IF NOT EXISTS planregister (
    id BIGSERIAL PRIMARY KEY,
    plan_id TEXT NOT NULL UNIQUE,
    plannavn TEXT NOT NULL,
    plantype TEXT,
    plantype_id INT,
    planstatus TEXT,
    planstatus_id INT,
    ikraft DATE,
    lovreferanse TEXT,
    lovreferanse_id INT,
    vertikalniva TEXT,
    vertikalniva_id INT,
    planbestemmelse TEXT,
    planbestemmelse_id INT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    map_url TEXT,
    regulations_url TEXT,
    description_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planregister_plan_id ON planregister(plan_id);
CREATE INDEX IF NOT EXISTS idx_planregister_plannavn ON planregister(plannavn);
CREATE INDEX IF NOT EXISTS idx_planregister_is_active ON planregister(is_active);

-- Sub-areas within a plan
CREATE TABLE IF NOT EXISTS felt (
    id BIGSERIAL PRIMARY KEY,
    planregister_id BIGINT NOT NULL REFERENCES planregister(id) ON DELETE CASCADE,
    navn TEXT NOT NULL,
    sortering INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_felt_planregister_id ON felt(planregister_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_felt_plan_navn ON felt(planregister_id, navn);

-- Individual plots inside a felt
CREATE TABLE IF NOT EXISTS tomt (
    id BIGSERIAL PRIMARY KEY,
    felt_id BIGINT NOT NULL REFERENCES felt(id) ON DELETE CASCADE,
    navn TEXT NOT NULL,
    sortering INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tomt_felt_id ON tomt(felt_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tomt_felt_navn ON tomt(felt_id, navn);

-- Hensynssone types
CREATE TABLE IF NOT EXISTS hensynssone_type (
    kode INT PRIMARY KEY,
    navn TEXT NOT NULL UNIQUE,
    sortering INT NOT NULL
);

-- Predefined bestemmelse structure
CREATE TABLE IF NOT EXISTS tema_kategori (
    id INT PRIMARY KEY,
    navn TEXT NOT NULL UNIQUE,
    sortering INT NOT NULL
);

CREATE TABLE IF NOT EXISTS tema_tittel (
    id INT PRIMARY KEY,
    tema_kategori_id INT NOT NULL REFERENCES tema_kategori(id) ON DELETE RESTRICT,
    navn TEXT NOT NULL,
    sortering INT NOT NULL,
    UNIQUE (tema_kategori_id, navn)
);

CREATE INDEX IF NOT EXISTS idx_tema_tittel_kategori ON tema_tittel(tema_kategori_id, sortering);

-- Building types
CREATE TABLE IF NOT EXISTS tiltaktype (
    id INT PRIMARY KEY,
    navn TEXT NOT NULL UNIQUE,
    sortering INT NOT NULL
);

-- Main bestemmelse content
CREATE TABLE IF NOT EXISTS bestemmelse (
    id BIGSERIAL PRIMARY KEY,
    planregister_id BIGINT NOT NULL REFERENCES planregister(id) ON DELETE CASCADE,
    tema_tittel_id INT REFERENCES tema_tittel(id) ON DELETE SET NULL,
    hensynssone_kode INT REFERENCES hensynssone_type(kode) ON DELETE SET NULL,
    innhold TEXT NOT NULL,
    sortering INT NOT NULL DEFAULT 0,
    opprettet TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    oppdatert TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bestemmelse_planregister ON bestemmelse(planregister_id, sortering);

-- Polymorphic scope for bestemmelser
CREATE TABLE IF NOT EXISTS bestemmelse_scope (
    id BIGSERIAL PRIMARY KEY,
    bestemmelse_id BIGINT NOT NULL REFERENCES bestemmelse(id) ON DELETE CASCADE,
    scope_type TEXT NOT NULL CHECK (scope_type IN ('plan', 'felt', 'tomt')),
    scope_ref_id BIGINT NOT NULL,
    UNIQUE (bestemmelse_id, scope_type, scope_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_bestemmelse_scope_lookup ON bestemmelse_scope(scope_type, scope_ref_id);

-- M:N between bestemmelse and tiltakstyper
CREATE TABLE IF NOT EXISTS bestemmelse_tiltaktype (
    bestemmelse_id BIGINT NOT NULL REFERENCES bestemmelse(id) ON DELETE CASCADE,
    tiltaktype_id INT NOT NULL REFERENCES tiltaktype(id) ON DELETE RESTRICT,
    PRIMARY KEY (bestemmelse_id, tiltaktype_id)
);
