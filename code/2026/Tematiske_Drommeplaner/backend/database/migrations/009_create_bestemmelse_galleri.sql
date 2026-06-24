-- Link bestemmelser to multiple gallery items (many-to-many)
-- Enables selecting multiple images per bestemmelse
-- tema_tittel_galeri items are primary, with fallback to all galleries

CREATE TABLE IF NOT EXISTS bestemmelse_galleri (
    id BIGSERIAL PRIMARY KEY,
    bestemmelse_id BIGINT NOT NULL,
    tema_tittel_galleri_id INT NOT NULL,
    sortering INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_bestemmelse FOREIGN KEY (bestemmelse_id)
        REFERENCES bestemmelse(id) ON DELETE CASCADE,
    CONSTRAINT fk_tema_tittel_galleri FOREIGN KEY (tema_tittel_galleri_id)
        REFERENCES tema_tittel_galeri(id) ON DELETE CASCADE,
    CONSTRAINT uq_bestemmelse_galleri UNIQUE (bestemmelse_id, tema_tittel_galleri_id)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_bestemmelse_galleri_bestemmelse_id 
    ON bestemmelse_galleri(bestemmelse_id);
CREATE INDEX IF NOT EXISTS idx_bestemmelse_galleri_tema_tittel_galleri_id 
    ON bestemmelse_galleri(tema_tittel_galleri_id);
