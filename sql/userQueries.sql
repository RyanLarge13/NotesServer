-- Find a user after successful jwt authentication
SELECT * FROM users WHERE userId = $1;
--  Find a user by traditional form login after expired jwt authentication or first time login
SELECT * FROM users
WHERE username = $1 AND email = $2;