-- Adding a foreign key to notes to reference the folder it resides within
ALTER TABLE notes
ADD COLUMN folderId INT, 
ADD FOREIGN KEY (folderId) REFERENCES folders(folderId);