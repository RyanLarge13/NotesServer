-- 0 Find user by email
SELECT * FROM users
WHERE email = $1;

-- 1 find note by id
SELECT * FROM notes
WHERE notesid = $1 AND userId = $2;

-- 2 Find connection by userId and other userId
SELECT * FROM connections 
WHERE friendOneId = $1 AND friendTwoId = $2 OR friendOneId = $2 AND friendTwoId
= $1;

-- 3 Create a new share
INSERT INTO sharerequests (reqToId, reqFromId, noteToShareId)
VALUES ($1, $2, $3)
RETURNING *;

-- 4 Check if share request already exists
SELECT * FROM sharerequests
WHERE reqId = $1;

-- 5 Remove share request
DELETE FROM sharerequests
WHERE reqId = $1
RETURNING *;

-- 6 Create share 
INSERT INTO sharednotes (toId, fromId, noteSharedId)
VALUES ($1, $2, $3)
RETURNING *;

-- 7 Delete share
DELETE FROM sharednotes
WHERE sharedNoteId = $1
RETURNiNG *;

-- 8 Check if share request exist by users and note
SELECT * FROM sharerequests
WHERE reqToId = $1 AND reqFromId = $2 OR reqToId = $2 AND reqFromId = $1 AND noteToShareId = $3;

-- 9 Check if a note is being shared to a user
SELECT * FROM sharednotes 
WHERE noteSharedId = $1 AND 
(toId = $2 OR fromId = $2);

-- 10
SELECT * FROM notes 
WHERE notesid = $1;