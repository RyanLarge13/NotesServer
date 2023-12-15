-- Dec 14, 2023
-- Migration for ADDING a lock variable to folders and then updating all current folders to contain the default false value

ALTER TABLE notes
ADD COLUMN locked BOOLEAN 
DEFAULT FALSE;

UPDATE notes
SET locked = FALSE;