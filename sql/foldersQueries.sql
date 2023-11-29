-- Get a users folders
SELECT * FROM folders
WHERE userId = $1;

-- Get a users notes from a specific folder
SELECT * FROM notes
WHERE folderId = $1;

-- Get a users folders ordered by title at time stamp
SELECT * FROM folders
WHERE userId = $1
ORDER BY title ASC;

-- Get a users folders where a clause is within the folders title
SELECT * FROM folders
WHERE userId = $1 AND LIKE $2;

-- Create a new folder 
INSERT INTO folders (title, color, parentFolderId)
VALUES ($1, $2, $3)
RETURNING *;

-- Edit a folder
UPDATE folders
SET title = $2, color = $3
WHERE userId = $1
RETURNING *;

-- Updaet a folders position
UPDATE folders
SET parentFolderId = $2
WHERE userId = $1
RETURNING *;

-- Delete a folder
DELETE FROM folders
WHERE userId = $1
RETURNING title;

-- Delete a folder and store return the entire folder if the user wants to undo his changes from the frontend
DELETE FROM folders
WHERE userId = $1
RETURNING *;

DELETE FROM folders
WHERE userId = $1 AND parentFolderId IS NOT NULL AND parentFolderId = $2;