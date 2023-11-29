-- Get a users notes
SELECT * FROM notes
WHERE userId = $1;

-- Get all user notes and return the parent folders to each of them if exsists
SELECT notes.* folders.folderId, folders.title
FROM notes
LEFT JOiN folders on notes.folderId = folders.folderId
WHERE notes.userId = $1;

-- Get a users notes ordered by created at time stamp
SELECT * FROM notes
WHERE userId = $1
ORDER BY createdAt ASC;

-- Get a users notes where a clause is within the html
SELECT * FROM notes
WHERE userId = $1 AND LIKE $2;

-- Create a new folder 
INSERT INTO notes (title, htmlNotes, folderId)
VALUES ($1, $2, $3)
RETURNING *;

-- Edit a note
UPDATE notes
SET title = $2, htmlNotes = $3
WHERE userId = $1
RETURNING *;

-- Update note position
UPDATE notes
SET folderId = $2
WHERE userId = $1
RETURNING *;

-- Delete a note
DELETE FROM notes
WHERE userId = $1
RETURNING title;

-- Delete a note and store return the entire note if the user wants to undo his changes from the frontend
DELETE FROM notes
WHERE userId = $1
RETURNING *;

-- Delete all folder notes
DELETE from notes
WHERE userId = $1 AND folderId = $2;
