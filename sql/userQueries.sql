-- Find a user after successful jwt authentication
SELECT * FROM users WHERE userId = $1;

-- Find a user and return jwt token signing information (don't return password)
SELECT
users.userId,
users.username,
users.email,
users.createdAt
FROM users
WHERE users.userId: $1

-- Find a user and return all of the user information for jwt signing (exclude password) but still include a user's folders and notes
SELECT
users.userId,
users.username,
users.email,
users.createdAt,
folders.*,
notes.*
LEFT JOIN folders ON users.userId = folders.userId
LEFT JOIN notes ON folders.folderId = notes.folderId
FROM users
WHERE users.userId: $1

--  Find a user by traditional form login after expired jwt authentication or first time login
SELECT * FROM users
WHERE username = $1 AND email = $2;

-- Find a user after authentication and return the related folders and notes for that user
SELECT * FROM users
LEFT JOIN folders ON user.userId = folders.userId
LEFT JOIN notes On folder.folderId = notes.folderId
WHERE users.userId = $1;

-- Find an authenticated user and their folders
SELECT * FROM users
LEFT JOIN folders ON user.userId = folders.userId
WHERE users.userId = $1;

-- Find an authenticated user and their notes
SELECT * FROM users
LEFT JOIN notes ON user.userId = notes.userId
WHERE users.userId = $1;

-- Update an authenticated user
UPDATE users
SET username = $2, email = $3
WHERE userId = $1;

-- Update users password
UPDATE users
SET password = $2
WHERE userId = $1;

-- Delete an authenticated user
DELETE FROM users
WHERE userId = $1;