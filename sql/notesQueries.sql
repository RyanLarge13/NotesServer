-- 0 Get a users notes
SELECT * FROM notes
WHERE userId = $1;

-- 1 Get all user notes and return the parent folders to each of them if exsists
SELECT notes.* folders.folderId, folders.title
FROM notes
LEFT JOiN folders on notes.folderId = folders.folderId
WHERE notes.userId = $1;

-- 2 Get a users notes ordered by created at time stamp
SELECT * FROM notes
WHERE userId = $1
ORDER BY createdAt ASC;

-- 3 Get a users notes where a clause is within the html
SELECT * FROM notes
WHERE userId = $1 AND LIKE $2;

-- 4 Create a new note 
INSERT INTO notes (userId, title, htmlNotes, locked, folderId)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- 5 Edit a note
UPDATE notes
SET title = $3, htmlNotes = $4, locked = $5, folderId = $6, updated = CURRENT_TIMESTAMP
WHERE userId = $1 AND notesId = $2
RETURNING *;

-- 6 Update note position
UPDATE notes
SET folderId = $3
WHERE userId = $1 AND notesId = $2
RETURNING *;

-- 7 Delete a note
DELETE FROM notes
WHERE userId = $1 AND notesId = $2
RETURNING *;

-- 8 Delete a note and store return the entire note if the user wants to undo his changes from the frontend
DELETE FROM notes
WHERE userId = $1
RETURNING *;

--9  Delete all folder notes
DELETE from notes
WHERE userId = $1 AND folderId = $2;

-- 10 Find a specific notes
SELECT * FROM notes
WHERE notesId = $1;

-- 11 Move note to trash or out of trash
UPDATE notes
SET trashed = $3
WHERE userId = $1 AND notesId = $2
RETURNING *;

-- 12 Favorite a note
UPDATE notes 
SET favorite = $3
WHERE userId = $1 AND notesId = $2
RETURNING *;

-- 13 Update a note text. Dangerous! Only use after serious authentication and authorization checks on your server
UPDATE notes
SET title = $2, htmlNotes = $3, locked = $4, folderId = $5, updated = CURRENT_TIMESTAMP
WHERE notesId = $1
RETURNING *;

-- 14 Update the lock on a note. Checking for userid making sure note belongs to them
UPDATE notes
SET locked = $2
WHERE notesId = $1 AND userId = $3
RETURNING *;