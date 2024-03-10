CREATE TABLE IF NOT EXISTS shareRequests  (
    reqId SERIAL PRIMARY KEY,
    reqToId INT NOT NULL,
    reqFromId INT NOT NULL,
    FOREIGN KEY (reqToId) REFERENCES users(userId),
    FOREIGN KEY (reqFromId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS sharedNotes (
    sharedNoteId SERIAL PRIMARY KEY,
    shared BOOLEAN DEFAULT false NOT NULL,
    toId INT NOT NULL,
    fromId INT NOT NULL,
    noteSharedId INT NOT NULL,
    FOREIGN KEY (noteSharedId) REFERENCES notes(notesId),
    FOREIGN KEY (toId) REFERENCES users(userId),
    FOREIGN KEY (fromId) REFERENCES users(userId)
);
