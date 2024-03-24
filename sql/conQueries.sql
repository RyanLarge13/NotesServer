-- 0 find user by email and return id
SELECT * FROM users 
WHERE email = $1;

-- 1 find if request exists
SELECT * FROM connectionReq
WHERE conReqFrom = $1 AND conReqTo = $2 OR conReqFrom = $2 AND conReqTo = $1;

-- 2 create a new connection request
INSERT INTO connectionReq (conReqFrom, conReqTo)
VALUES ($1, $2)
RETURNING *;

-- 3 check if connection already exists
SELECT * FROM connections
WHERE friendOneId = $1 AND friendTwoId = $2 OR friendTwoId = $2 AND friendOneId = $1;

-- 4 Delete a connection
DELETE FROM connections
WHERE friendOneId = $1 AND friendTwoId = $2 OR friendTwoId = $2 AND friendOneId = $1
RETURNING *; 

-- 5 Remove existing connection request
DELETE FROM connectionReq
WHERE conReqId = $1
RETURNING *; 

-- 6 Fond connection request by id
SELECT * FROm connectionReq
WHERE conReqId = $1;

-- 7 Create a new connection
INSERT INTO connections (friendOneId, friendTwoId)
VALUES ($1, $2)
RETURNING *;

-- 8 Remove existing connection request
DELETE FROM connectionReq
WHERE conReqId = $1;