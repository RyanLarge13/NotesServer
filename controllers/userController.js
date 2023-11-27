import pool from "../utils/dbConnection";
import fs from "fs";
import path from "path";
import bcryptjs from "bcryptjs";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const userQueriesPath = path.join(__dirname, "../sql/userQueries.sql");

const userQueries = fs.readFileSync(userQueriesPath, "utf-8").split(";");

class UserController {
  constructor() {
    // Private methods for this specific class. Indicated by their initialization within the class contstructor and the underscore
    // at the begining of the variable name
    this._serverError = (res, message) => {
      return res.status(500).json({ message: message });
    };
    this._badRequesstError = (res, message) => {
      return res.status(400).json({ message: message });
    };
    this._authError = (res, message) => {
      return res.status(401).json({ message: message });
    };
    this._notFoundError = (res, message) => {
      return res.status(404).json({ message: message });
    };
    this._successResponse = (res, message, data) => {
      return res.status(200).json({ message: message, data: data });
    };
    this._successCreate = (res, message, data) => {
      return res.status(201).json({ message: message, data: data });
    };
  }

  async getUserData(req, res) {
    const userId = req.user;
    if (!userId) {
      return this._authError(
        res,
        "There was a problem authenticating your account. Please log back in and try again"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const user = await userClient.query(userQueries[0], userId);
        if (user.rows.length === 0) {
          return this._notFoundError(
            res,
            "No user was found in out records with your credentials, please try to login again"
          );
        }
        const userData = user.rows[0];
        return this._successResponse(
          res,
          "Successfully fetched users information",
          userData
        );
      } catch (err) {
        console.error("Error executing query:", err);
        if (err instanceof SyntaxError) {
          return this._serverError(res, "Syntax error in SQL query");
        } else if (err.code === "ECONNREFUSED") {
          return this._serverError(res, "Connection to the database refused");
        } else {
          return this._serverError(res, "Internal server error");
        }
      }
    } catch (err) {
      console.error(
        `Error with pool connection when calling userController.getUserData: ${err}`
      );
      return this._serverError(
        res,
        "There was an issue connecting to the db. Please try to refresh the page and attempt to login again"
      );
    }
  }
  async loginUser(req, res) {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return this._badRequesstError(
        res,
        "Please complete all form data with valid credentials"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const user = await userClient.query(userQueries[1], [username, email]);
        if (user.rows.length === 0) {
          return this._notFoundError(
            res,
            "No user with these credentials was found with that username and email were found, Please try to login agains"
          );
        }
        const userData = user.rows[0];
        const dbPassword = userData.password;
        const isMatch = await bcryptjs.compare();
      } catch (err) {
        console.error("Error executing query:", err);
        if (err instanceof SyntaxError) {
          return this._serverError(res, "Syntax error in SQL query");
        } else if (err.code === "ECONNREFUSED") {
          return this._serverError(res, "Connection to the database refused");
        } else {
          return this._serverError(res, "Internal server error");
        }
      }
    } catch (err) {
      console.error(
        `Error with pool connection when calling userController.getUserData: ${err}`
      );
      return this._serverError(
        res,
        "There was an issue connecting to the db. Please try to refresh the page and attempt to login again"
      );
    }
  }
  async signupUser(req, res) {}
  async updateUser(req, res) {}
  async deleteUser(req, res) {}
}

export default UserController;
