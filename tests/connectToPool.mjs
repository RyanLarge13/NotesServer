import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const poolDetails = {
  user: process.env.DB_USER_RW,
  host: process.env.DB_HOST_RW,
  database: process.env.DB_NAME_RW,
  password: process.env.DB_PASSWORD_RW,
  port: 5432,
};

console.log(poolDetails);

const pool = new Pool(poolDetails);

const connection = async () => {
  try {
    await pool.connect();
    console.log("pool connected");
  } catch (err) {
    console.log(err);
  }
};

connection();
