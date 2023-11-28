ALTER TABLE folders
ADD COLUMN parentFolderId INT,
ADD FOREIGN KEY (parentFolderId) REFERENCES folders(folderId);