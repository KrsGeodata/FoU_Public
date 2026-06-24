-- Create: Datafelt type table (predefined enum values)
CREATE TABLE IF NOT EXISTS datafelt_type (
    id SERIAL PRIMARY KEY,
    navn VARCHAR(120) NOT NULL UNIQUE,
    sortering INT DEFAULT 0
);

-- Create: Tema tittel galleri mapping table
CREATE TABLE IF NOT EXISTS tema_tittel_galeri (
    id SERIAL PRIMARY KEY,
    tema_tittel_id INT NOT NULL,
    forklaring VARCHAR(500) NOT NULL,
    overskrift VARCHAR(255) NOT NULL,
    bildefilnavn VARCHAR(255),
    forklaringstekst TEXT,
    datafelt_type_id INT,
    sortering INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_tema_tittel FOREIGN KEY (tema_tittel_id) 
        REFERENCES tema_tittel(id) ON DELETE CASCADE,
    CONSTRAINT fk_datafelt_type FOREIGN KEY (datafelt_type_id) 
        REFERENCES datafelt_type(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tema_tittel_galeri_tema_tittel_id 
    ON tema_tittel_galeri(tema_tittel_id);
