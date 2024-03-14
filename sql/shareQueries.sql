-- 0 Find user by email
SELECT * FROM users
WHERE email = $1
RETURNING *;

-- 1 find note by id
SELECT * FROM notes
WHERE notesid = $1 AND userId = $2
RETURNING *;

-- 2 Find connection by userId and other userId
SELECT * FROM connections 
WHERE friendOneId = $1 AND friendTwoId = $2 OR friendOneId = $2 AND friendTwoId
= $1
RETURNING *;