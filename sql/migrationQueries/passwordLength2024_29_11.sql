-- Drop password column (length too short)
ALTER TABLE users 
    DROP COLUMN password;

-- ADD new password column with longer length
ALTER TABLE users 
    ADD COLUMN password VARCHAR(255) NOT NULL;