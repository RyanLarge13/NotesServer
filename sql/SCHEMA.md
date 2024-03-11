# DB Schema

## User table

```
CREATE TABLE IF NOT EXISTS users (
userId SERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL,
email VARCHAR(40) NOT NULL,
password VARCHAR(255) NOT NULL,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Folders Table

```
CREATE TABLE IF NOT EXISTS folders (
folderId SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
color VARCHAR(20) NOT NULL,
userId INT NOT NULL,
parentFolderId INT,
FOREIGN KEY (userId) REFERENCES users(userId)
FOREIGN KEY (parentFolderId) REFERENCES folders(folderId) ON DELETE CASCADE;
);
```

## Notes Table

```
CREATE TABLE IF NOT EXISTS notes (
notesId SERIAL PRIMARY KEY NOT NULL,
title VARCHAR(255) NOT NULL,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
htmlNotes TEXT,
locked BOOLEAN DEFAULT NOT NULL
userId INT NOT NULL,
folderId INT,
FOREIGN KEY (userId) REFERENCES users(userId)
FOREIGN KEY (folderId) REFERENCES folders(folderId) ON DELETE CASCADE;
);
```

## ShareRequests

```
CREATE TABLE IF NOT EXISTS shareRequests (
    reqId SERIAL PRIMARY KEY,
    reqToId INT NOT NULL,
    reqFromId INT NOT NULL,
    FOREIGN KEY (reqToId) REFERENCES users(userId),
    FOREIGN KEY (reqFromId) REFERENCES users(userId)
);
```

## SharedNotes

```
CREATE TABLE IF NOT EXISTS sharedNotes (
    sharedNoteId SERIAL PRIMARY KEY,
    shared BOOLEAN DEFAULT false NOT NULL,
    toId INT NOT NULL,
    fromId INT NOT NULL,
    noteSharedId INT NOT NULL,
    FOREIGN KEY (noteSharedId) REFERENCES notes(notesId),
    FOREIGN KEY (toId) REFERENCES users(userId),
    FOREIGN KEY (fromId) REFERENCES users(userId)sharedNotes
);
```
