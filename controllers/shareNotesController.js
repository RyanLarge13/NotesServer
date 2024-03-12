import ResponseHandler from "../utils/ResponseHandler.js";
import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";

const resHandler = new ResponseHandler();
const validator = new Validator();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const shareQueryPath = path.join(__dirname, "../sql/shareQueries.sql");
const shareQueries = fs.readFileSync(shareQueryPath, "utf-8").split(";");

export const postNewShare = (req, res) => {
  const user = req.user;
  const { to, note } = req.body;
};
