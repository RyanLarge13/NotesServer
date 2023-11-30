-- Remove email column
ALTER TABLE users
    DROP COLUMN email;
 
-- ADD a new email column with unique attached   
ALTER TABLE users 
    ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE;