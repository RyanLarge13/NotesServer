import fs from "fs";
import path from "path";
import pool from "../utils/dbConnection.js";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const createTablesSQLFile = "../sql/migrationQueries/createTables.sql";
const queries = fs.readFileSync(
  path.join(__dirname, createTablesSQLFile),
  "utf-8"
);

const createTables = async () => {
  const client = await pool.connect();
  console.log("Connection opened");
  try {
    await client.query(queries);
    console.log("Tables created successfully");
  } catch (err) {
    console.log(err);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

createTables();
