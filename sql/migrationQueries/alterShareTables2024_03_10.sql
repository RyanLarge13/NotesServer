ALTER TABLE sharedNotes 
DROP COLUMN shared;

ALTER TABLE shareRequests 
ADD COLUMN noteToShareId INT NOT NULL,
ADD CONSTRAINT FK_noteToShareId FOREIGN KEY (noteToShareId) REFERENCES
notes(notesid);

CREATE TABLE IF NOT EXISTS connectionReq (
  conReqId SERIAL PRIMARY KEY, 
  conReqFrom INT NOT NULL, 
  conReqTo INT NOT NULL, 
  FOREIGN KEY (conReqFrom) REFERENCES users(userid), 
  FOREIGN KEY (conReqTo) REFERENCES users(userid)
);

CREATE TABLE IF NOT EXISTS connections (
  conId SERIAL PRIMARY KEY, 
  friendOneId INT NOT NULL, 
  friendTwoId INT NOT NULL, 
  FOREIGN KEY (friendOneId) REFERENCES users(userid), 
  FOREIGN KEY (friendTwoId) REFERENCES users(userid)
);
