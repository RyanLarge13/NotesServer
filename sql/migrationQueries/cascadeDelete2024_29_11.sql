BEGIN;

-- Viewing the existing constraints to drop from table and create a new one
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'folders'::regclass;

SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'notes'::regclass;

-- Creating an on cascade delete effect for folders table references 
ALTER TABLE folders
DROP CONSTRAINT IF EXISTS folders_parentfolderid_fkey;

ALTER TABLE folders
DROP CONSTRAINT IF EXISTS folders_userid_fkey;

ALTER TABLE folders
ADD CONSTRAINT folders_parentfolderid_fkey 
FOREIGN KEY (parentFolderId) REFERENCES folders(folderId) ON DELETE CASCADE;

ALTER TABLE folders
ADD CONSTRAINT folders_userid_fkey 
FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE;

-- Creating an on cascade delete effect for notes table references 
ALTER TABLE notes 
DROP CONSTRAINT IF EXISTS notes_folderid_fkey;

ALTER TABLE notes 
DROP CONSTRAINT IF EXISTS notes_userid_fkey;

ALTER TABLE notes 
ADD CONSTRAINT notes_folderid_fkey 
FOREIGN KEY (folderId) REFERENCES folders(folderId) ON DELETE CASCADE;

ALTER TABLE notes 
ADD CONSTRAINT notes_userid_fkey 
FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE;

COMMIT;
