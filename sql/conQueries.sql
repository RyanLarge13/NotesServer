-- 0 find user by email and return id
SELECT * FROM users 
WHERE email = $1
RETURNING userid;

-- 1 find if request exists
SELECT * FROM connectionReq
WHERE conReqFrom = $1 AND conReqTo = $2 OR conReqFrom = $2 AND conReqTo = $1
RETURNING *;

-- 2 create a new connection request
INSERT INTO connectionReq (conReqFrom, conReqTo)
VALUES ($1, $2)
RETURNING *

-- 3 check if connection already exists
SELECT * FROM connections
WHERE friendOneId = $1 AND friendTwoId = $2 OR friendTwoId = $2 AND friendOneId = $1
RETURNING *;

-- 4 Delete a connection
DELETE from connections
WHERE friendOneId = $1 AND friendTwoId = $2 OR friendTwoId = $2 AND friendOneId = $1
RETURNING *; 