--                                               GET REQUESTS 0 - 6
-- 0 Find a user after successful jwt authentication
SELECT * FROM users WHERE userId = $1;

-- 1 Find a user and return jwt token signing information (don't return password)
SELECT
	users.userId,
	users.username,
	users.email,
	users.createdAt
FROM 
	users
WHERE 
	users.userId = $1;

-- 2 Find a user and return all of the user information
SELECT
    users.userId,
    users.username,
    users.email,
    users.createdAt,
    folders.folderId AS folderId, 
    folders.color AS folderColor,
    folders.title AS folderTitle,
    folders.parentFolderId AS parentFolderId, 
	notes.notesId AS noteId, 
    notes.title AS noteTitle,
    notes.locked AS locked, 
    notes.htmlNotes AS htmlText,
  	notes.folderId AS noteFolderId,
  	notes.createdAt AS noteCreatedAt,
	notes.trashed AS trashed,
	notes.favorite AS favorite,
	notes.updated AS noteUpdated,
	connectionReq.conReqId,
	connections.conId,
	shareRequests.reqId,
	sharedNote.notesId AS sharedNoteId,
    sharedNote.title AS sharedNoteTitle,
    sharedNote.locked AS sharedNoteLocked,
    sharedNote.htmlNotes AS sharedNoteHtmlText,
    sharedNote.folderId AS sharedNoteFolderId,
    sharedNote.createdAt AS sharedNoteCreatedAt,
    sharedNote.trashed AS sharedNoteTrashed,
	sharedNote.favorite AS sharedNoteFavorite,
    sharedNote.updated AS sharedNoteUpdated,
	shareReqNote.notesId AS shareReqNoteId,
    shareReqNote.title AS shareReqNoteTitle,
    shareReqNote.createdAt AS shareReqNoteCreatedAt,
   CASE 
        WHEN connectionReq.conReqFrom = users.userId THEN toUser.email
        ELSE fromUser.email
    END AS connectionReqEmail,
    fromUser.email AS fromUserEmail,
    toUser.email AS toUserEmail,
	CASE 
        WHEN connections.friendOneId = users.userId THEN conOneUser.email
        ELSE conTwoUser.email
    END AS connectionEmail,
    conOneUser.email AS conUserEmailOne,
    conTwoUser.email AS conUserEmailTwo,
	CASE 
		WHEN shareRequests.reqFromId = users.userId THEN shareReqTo.email
		ELSE shareReqFrom.email
	END AS shareRequestsEmail,
	shareReqFrom.email AS shareReqFromEmail,
	shareReqTo.email AS shareReqToEmail,
	shareRequests.noteToShareId AS shareReqNoteId
FROM
    users
LEFT JOIN
    folders ON users.userId = folders.userId
LEFT JOIN
    notes ON users.userId = notes.userId
	-- join connection requests
LEFT JOIN 
    connectionReq ON users.userId = connectionReq.conReqTo OR users.userId = connectionReq.conReqFrom
LEFT JOIN
    users AS toUser ON connectionReq.conReqTo = toUser.userId
LEFT JOIN
    users AS fromUser ON connectionReq.conReqFrom = fromUser.userId
	-- Join connections
LEFT JOIN
    connections ON users.userId = connections.friendOneId OR users.userId = connections.friendTwoId
LEFT JOIN
    users AS conOneUser ON connections.friendOneId = conOneUser.userId
LEFT JOIN
    users AS conTwoUser ON connections.friendTwoId = conTwoUser.userId
	-- Join share requests
LEFT JOIN 
	shareRequests ON users.userId = shareRequests.reqFromId OR users.userId = shareRequests.reqToId
LEFT JOIN 
	users AS shareReqFrom ON shareRequests.reqFromId = shareReqFrom.userId
LEFT JOIN 
	users AS shareReqTo ON shareRequests.reqToId = shareReqTo.userId
LEFT JOIN 
	notes AS shareReqNote ON shareRequests.noteToShareId = shareReqNote.notesid
	-- Join shared notes
LEFT JOIN 
    sharedNotes ON users.userId = sharedNotes.toId
LEFT JOIN 
    notes AS sharedNote ON sharedNotes.noteSharedId = sharedNote.notesId
	-- end joins
WHERE
    users.userId = $1
ORDER BY 
    folders.parentFolderId IS NOT NULL, folders.parentFolderId, folders.folderId;


--  Find a user by traditional form login after expired jwt authentication or first time login
SELECT * FROM users
WHERE username = $1 AND email = $2;

-- Find a user after authentication and return the related folders and notes for that user
SELECT * FROM users
LEFT JOIN folders ON users.userId = folders.userId
LEFT JOIN notes ON users.userId = notes.userId
WHERE users.userId = $1;

-- Find an authenticated user and their folders
SELECT * FROM users
LEFT JOIN folders ON users.userId = folders.userId
WHERE users.userId = $1;

-- Find an authenticated user and their notes
SELECT * FROM users
LEFT JOIN notes ON user.userId = notes.userId
WHERE users.userId = $1;

--                                                  CREATE REQUESTS 7
-- Create a new user on signin and return jwt signing and basic user information for a client response
INSERT INTO users (username, email, password)
VALUES ($1, $2, $3)
RETURNING userId, username, email, createdAt;

--                                                  UPDATE REQUESTS 8 - 9
-- Update an authenticated user username and email and return a jwt signable object
UPDATE users
SET 
    username = COALESCE($2, username), 
    email = COALESCE($3, email)
WHERE 
    userId = $1
RETURNING userId, username, email, createdAt;

-- Update users password and returning updated user for server use only. Not for signing or updating client
UPDATE users
SET password = $2
WHERE userId = $1
RETURNING *;

--                                                  DELETE REQUESTS 10 - 11
-- Delete an authenticated user
DELETE FROM users
WHERE userId = $1
RETURNING *;

--                                                ULTIMATE USER DATA QUERY
-- Fetch a user and all related fields for proper nesting and structuring of the users information including folders subfolders and notes
WITH RECURSIVE FolderHierarchy AS (
SELECT
	folderId,
	title,
	color,
	userId,
NULL::INT AS parentFolderId
FROM folders
WHERE userId = $1 AND parentFolderId IS NULL

UNION ALL

SELECT
	f.folderId,
	f.title,
	f.color,
	f.userId,
	f.parentFolderId
FROM
	folders f
JOIN
	FolderHierarchy fh ON f.parentFolderId = fh.folderId
)
SELECT
	u.userId,
	u.username,
	u.email,
	fh.folderId,
	fh.title AS folderTitle,
	fh.color AS folderColor,
	nh.id AS noteId,
	nh.title AS noteTitle,
	nh.locked AS locked, 
	nh.createdAt AS noteCreatedAt,
	nh.htmlNotes
FROM
	users u
JOIN
	FolderHierarchy fh ON u.userId = fh.userId
LEFT JOIN
	notes nh ON fh.folderId = nh.folderId
ORDER BY
	fh.folderId, nh.createdAt;

-- Find a user after successful jwt authentication
SELECT * FROM users WHERE email = $1;

-- Update user password
UPDATE users 
SET password = $2
WHERE email = $1
RETURNING *;