
-- Drop the existing column
ALTER TABLE notes
    DROP COLUMN id;

-- Add a new column with the desired name
ALTER TABLE notes
    ADD COLUMN notesId SERIAL PRIMARY KEY;