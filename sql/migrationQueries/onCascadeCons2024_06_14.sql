BEGIN

SELECT
    conname,
    conrelid::regclass AS table,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f' AND conrelid IN ('sharedNotes'::regclass, 'shareRequests'::regclass, 'connectionReq'::regclass, 'connections'::regclass);


ALTER TABLE sharedNotes
DROP CONSTRAINT IF EXISTS sharedNotes_toId_fkey
DROP CONSTRAINT IF EXISTS sharedNotes_fromId_fkey;

ALTER TABLE shareRequests
DROP CONSTRAINT IF EXISTS shareRequests_reqToId_fkey
DROP CONSTRAINT IF EXISTS shareRequests_reqFromId_fkey;

ALTER TABLE connectionReq
DROP CONSTRAINT IF EXISTS connectionReq_conReqfrom_fkey
DROP CONSTRAINT IF EXISTS connectionReq_conReqTo_fkey;

ALTER TABLE connections
DROP CONSTRAINT IF EXISTS connections_friendOneId_fkey
DROP CONSTRAINT IF EXISTS connections_friendTwoId_fkey;

ALTER TABLE sharedNotes
ADD CONSTRAINT sharedNotes_toId_fkey
ADD CONSTRAINT sharedNotes_fromId_fkey
FOREIGN KEY (toId) REFERENCES users(userId) ON DELETE CASCADE
FOREIGN KEY (fromId) REFERENCES users(userId)sharedNotes ON DELETE CASCADE;

ALTER TABLE shareRequests
ADD CONSTRAINT shareRequests_reqToId_fkey
ADD CONSTRAINT shareRequests_reqFromId_fkey
FOREIGN KEY (reqToId) REFERENCES users(userId) ON DELETE CASCADE
FOREIGN KEY (reqFromId) REFERENCES users(userId) ON DELETE CASCADE;

ALTER TABLE connectionReq
ADD CONSTRAINT connectionReq_conReqfrom_fkey
ADD CONSTRAINT connectionReq_conReqTo_fkey
FOREIGN KEY (conReqFrom) REFERENCES users(userId) ON DELETE CASCADE
FOREIGN KEY (conReqTo) REFERENCES users(userId) ON DELETE CASCADE;

ALTER TABLE connections
ADD CONSTRAINT connectionReq_friendOneId_fkey
ADD CONSTRAINT connectionReq_friendTwoId_fkey
FOREIGN KEY (friendOneId) REFERENCES users(userId) ON DELETE CASCADE
FOREIGN KEY (friendTwoId) REFERENCES users(userId) ON DELETE CASCADE;

COMMIT