import fs from "fs";
import path from "path";
import pool from "./dbConnection.js";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

class Migrator {
  async migrate(sqlFile) {
    const queries = fs.readFileSync(path.join(__dirname, sqlFile), "utf-8");
    const client = await pool.connect();
    console.log("Connection opened");
    try {
      const data = await client.query(queries);
      console.log("Query executed");
      console.log(data);
    } catch (err) {
      console.log(err);
    } finally {
      client.release();
      console.log("Connection closed");
    }
  }
}

export default Migrator;
