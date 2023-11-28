import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";
import bcryptjs from "bcryptjs";
import signUser from "../auth/signUser.js";
import ResponseHandler from "../utils/ResponseHandler.js";

const resHandler = new ResponseHandler();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const userQueriesPath = path.join(__dirname, "../sql/userQueries.sql");

const userQueries = fs.readFileSync(userQueriesPath, "utf-8").split(";");

class UserController {
  // Private contructor methods specific for this class,
  // indicated by the "_" underscore character at the start of the method name
  constructor() {
    this._connectionError = (res, err, controllerCall) => {
      console.error(
        `Error with pool connection when calling userController.${controllerCall}: ${err}`
      );
      return resHandler.serverError(
        res,
        "There was an issue connecting to the db. Please try to refresh the page and attempt to login again"
      );
    };
    this._executingQueryError = (res, err) => {
      console.error("Error executing query:", err);
      if (err instanceof SyntaxError) {
        return resHandler.serverError(res, "Syntax error in SQL query");
      } else if (err.code === "ECONNREFUSED") {
        return resHandler.serverError(
          res,
          "Connection to the database refused"
        );
      } else {
        return resHandler.serverError(res, "Internal server error");
      }
    };
  }

  async getUserData(req, res) {
    const userId = req.user;
    if (!userId) {
      return resHandler.authError(
        res,
        "There was a problem authenticating your account. Please log back in and try again"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const user = await userClient.query(userQueries[0], [userId]);
        if (user.rows.length === 0) {
          return resHandler.notFoundError(
            res,
            "No user was found in out records with your credentials, please try to login again"
          );
        }
        const userData = user.rows[0];
        return resHandler.successResponse(
          res,
          "Successfully fetched users information",
          userData
        );
      } catch (err) {
        return this._executingQueryError(res, err);
      }
    } catch (err) {
      return this._connectionError(res, err, "getUserData");
    }
  }

  async loginUser(req, res) {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return resHandler.badRequesstError(
        res,
        "Please complete all form data with valid credentials"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const loginQuery = userQueries[3];
        const user = await userClient.query(loginQuery, [username, email]);
        if (user.rows.length === 0) {
          return resHandler.notFoundError(
            res,
            "No user with these credentials was found with that username and email were found, Please try to login agains"
          );
        }
        const userData = user.rows[0];
        const dbPassword = userData.password;
        const isMatch = await bcryptjs.compare(password, dbPassword);
        if (!isMatch) {
          return resHandler.authError(res, "Incorrect password");
        }
        const jwtUser = {
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        };
        const token = signUser(jwtUser);
        return resHandler.successResponse(res, token);
      } catch (err) {
        return this._executingQueryError(res, err);
      }
    } catch (err) {
      return this._connectionError(res, err, "loginUser");
    }
  }

  async signupUser(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return resHandler.badRequesstError(
        res,
        "You must fill out all form data to create a new account"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        if (!hashedPassword) {
          return resHandler.serverError(
            res,
            "Something went wrong on the server processing your request, we appologize for the inconvenience. Please reload the app and try again"
          );
        }
        const createUserQuery = userQueries[7];
        const newDbUser = await userClient.query(createUserQuery, [
          username,
          email,
          hashedPassword,
        ]);
        if (newDbUser.rows.length === 0) {
          console.log("Error creating a new user");
          return resHandler.serverError(
            res,
            "There was a problem on our end creating your account. Please refresh and try again"
          );
        }
        const newUserData = newDbUser.rows[0];
        const newToken = signUser(newUserData);
        return resHandler.successCreate(
          res,
          "Successfully created your new account!",
          newToken
        );
      } catch (err) {
        return this._executingQueryError(res, err);
      }
    } catch (err) {
      return this._connectionError(res, err, "signupUser");
    }
  }

  async updateUser(req, res) {
    const { newUsername, newEmail } = req.body;
    const { userId } = req.user;
    if (!newUsername && !newEmail) {
      return resHandler.badRequesstError(
        res,
        "You did not provide an updated username or email. Please change at least one field to complete your update"
      );
    }
    try {
      const updateUserClient = await pool.connect();
      try {
        const updateQuery = userQueries[8];
        const updatedUser = await updateUserClient.query(updateQuery, [
          userId,
          newUsername,
          newEmail,
        ]);
        if (updatedUser.rows.length === 0) {
          return resHandler.serverError(
            res,
            "There was a problem updating your account, Please login and try again"
          );
        }
        const newUpdatedUser = updatedUser.rows[0];
        const newlySignedToken = signUser(newUpdatedUser);
        return resHandler.successResponse(
          res,
          "Your account was successfully updated",
          { token: newlySignedToken, user: newUpdatedUser }
        );
      } catch (err) {
        return this._executingQueryError(res, err);
      }
    } catch (err) {
      return this._connectionError(res, err, "updateUser");
    }
  }

  async updateUserPassword(req, res) {
    const { newPassword } = req.body;
    const { userId } = req.user;
    if (!newPassword) {
      return resHandler.badRequesstError(
        res,
        "Please provide a new password to update your account"
      );
    }
    if (!userId) {
      return resHandler.authError(
        res,
        "Something went wrong while authenticating your request, please try updatin gyour password again"
      );
    }
    try {
      const updateUserPassClient = await pool.connect();
      try {
        const updateQuery = userQueries[9];
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        if (!hashedPassword) {
          return resHandler.serverError(
            res,
            "Something went wrong creating your new password. Please try updating it again"
          );
        }
        const newUpdatedUser = await updateUserPassClient.query(updateQuery, [
          userId,
          hashedPassword,
        ]);
        if (newUpdatedUser.rows.length < 1) {
          return resHandler.serverError(
            res,
            "Something went wrong updating your account, Please login and try again"
          );
        }
        return resHandler.successResponse(
          res,
          "Your new password if officially set",
          null
        );
      } catch (err) {
        return this._executingQueryError(res, err);
      }
    } catch (err) {
      return this._connectionError(res, err, "updateUserPassword");
    }
  }

  async deleteUser(req, res) {
    const { userId } = req.user;
    if (!userId) {
      return resHandler.authError(
        res,
        "Something went wrong authenticating your request,. Please login and try again"
      );
    }
    try {
      const deleteUserClient = await pool.connect();
      try {
        const deleteUserQuery = userQueries[10];
        const deletedUser = await deleteUserClient(deleteUserQuery, [userId]);
        if (deletedUser.rows < 1) {
          return resHandler.serverError(
            res,
            "There was a problem deleting your account, Please try again later"
          );
        }
        return resHandler.successResponse(
          res,
          "You account was successfully deleted",
          null
        );
      } catch (err) {
        return this._executingQueryError(res, err);
      }
    } catch (err) {
      return this._connectionError(res, err, "updateUserPassword");
    }
  }
}

export default UserController;
