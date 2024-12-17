import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER_RW,
//   host: process.env.DB_HOST_RW,
//   database: process.env.DB_NAME_RW,
//   password: process.env.DB_PASSWORD_RW,
//   port: 21542,
// });

const pool = new Pool({
  user: process.env.DB_USER_RW,
  host: process.env.DB_HOST_RW,
  database: process.env.DB_NAME_RW,
  password: process.env.DB_PASSWORD_RW,
  port: 5432,
});

export default pool;
