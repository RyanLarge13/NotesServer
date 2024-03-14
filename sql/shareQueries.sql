SELECT * FROM users
WHERE email = $1
RETURNING *;

SELECT * FROM notes
WHERE notesid = $1 AND userId = $2
RETURNING *;
