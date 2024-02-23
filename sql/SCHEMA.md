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

## General Category Table

```
CREATE TABLE IF NOT EXISTS categories (
categoryId SERIAL PRIMARY KEY,
name VARCHAR(255),
description VARCHAR(255),
userId INT NOT NULL,
FOREIGN KEY (userId) REFERENCES users(userId)
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

## Folder Category Table

```
CREATE TABLE IF NOT EXISTS folderCategories (
folderId INT NOT NULL,
categoryId INT NOT NULL,
PRIMARY KEY (folderId, categoryId),
FOREIGN KEY (folderId) REFERENCES folders(folderId),
FOREIGN KEY (categoryId) REFERENCES categories(categoryId)
);
```
