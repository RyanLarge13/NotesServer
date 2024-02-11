-- Get all trashed notes from a user
SELECT * FROM trash
WHERE userId = $1;

-- Create a trashed note
INSERT INTO trash (title, htmlNotes, locked, userId)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- Delete a trashed item 
DELETE FROM trash 
WHERE trashid = $1;

-- Delete a user's entire trash bin
DELETE FROM trash
WHERE userId = $1;