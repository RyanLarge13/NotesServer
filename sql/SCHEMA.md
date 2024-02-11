-- All table comments indicate updates to the table.

CREATE TABLE IF NOT EXISTS users (
userId SERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL,
email VARCHAR(40) NOT NULL,
-- password VARCHAR(255) NOT NULL
password VARCHAR(20) NOT NULL,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
categoryId SERIAL PRIMARY KEY,
name VARCHAR(255),
description VARCHAR(255),
userId INT NOT NULL,
FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS folders (
folderId SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
color VARCHAR(20) NOT NULL,
userId INT NOT NULL,
-- ADD COLUMN parentFolderId INT,
FOREIGN KEY (userId) REFERENCES users(userId)
-- ADD FOREIGN KEY (parentFolderId) REFERENCES folders(folderId) ON DELETE CASCADE;
);

CREATE TABLE IF NOT EXISTS notes (
-- DROP COLUMN id
-- ADD COLUMN notesId SERIAL PRIMARY KEY
id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
htmlNotes TEXT,
-- ADD COLUMN locked BOOLEAN
userId INT NOT NULL,
-- ADD COLUMN folderId INT,
FOREIGN KEY (userId) REFERENCES users(userId)
-- ADD FOREIGN KEY (folderId) REFERENCES folders(folderId) ON DELETE CASCADE;
);

CREATE TABLE IF NOT EXISTS folderCategories (
folderId INT NOT NULL,
categoryId INT NOT NULL,
PRIMARY KEY (folderId, categoryId),
FOREIGN KEY (folderId) REFERENCES folders(folderId),
FOREIGN KEY (categoryId) REFERENCES categories(categoryId)
);

-- Dropped this table 2024/02/11 ****************************\*\*\*****************************
-- CREATE TABLE IF NOT EXISTS trash (
-- trashid SERIAL PRIMARY KEY,
-- title VARCHAR(255) NOT NULL,
-- createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- htmlNotes TEXT,
-- locked BOOLEAN,
-- userId INT NOT NULL,
-- FOREIGN KEY (userId) REFERENCES users(userId)
-- );
