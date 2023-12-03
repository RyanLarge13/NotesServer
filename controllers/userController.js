import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";
import bcryptjs from "bcryptjs";
import signUser from "../auth/signUser.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import FormatData from "../utils/FormatData.js";

const resHandler = new ResponseHandler();
const formatter = new FormatData();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const userQueriesPath = path.join(__dirname, "../sql/userQueries.sql");

const userQueries = fs.readFileSync(userQueriesPath, "utf-8").split(";");

class UserController {
  async getUserData(req, res) {
    const { userId } = req.user;
    if (!userId) {
      return resHandler.authError(
        res,
        "There was a problem authenticating your account. Please log back in and try again"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const user = await userClient.query(userQueries[2], [userId]);
        if (user.rows.length === 0) {
          return resHandler.notFoundError(
            res,
            "No user was found in out records with your credentials, please try to login again"
          );
        }
        const userData = formatter.toObject(user.rows);
        return resHandler.successResponse(
          res,
          "Successfully fetched users information",
          userData
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        userClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "getUserData");
    }
  }

  async loginUser(req, res) {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return resHandler.badRequestError(
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
            "No user with these credentials was found with the username and email that were provided, Please try to login agains"
          );
        }
        const userData = user.rows[0];
        console.log(userData);
        const dbPassword = userData.password;
        const isMatch = await bcryptjs.compare(password, dbPassword);
        if (!isMatch) {
          return resHandler.authError(res, "Incorrect password");
        }
        const jwtUser = {
          userId: userData.userid,
          username: userData.username,
          email: userData.email,
          createdAt: userData.createdat,
        };
        console.log(jwtUser);
        const token = signUser(jwtUser);
        return resHandler.successResponse(
          res,
          "You were successfully authenticated and are now logged in",
          token
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        userClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "loginUser");
    }
  }

  async signupUser(req, res) {
    console.log(req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return resHandler.badRequestError(
        res,
        "You must fill out all form data to create a new account"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const exsistingUser = await userClient.query(userQueries[12], [email]);
        if (exsistingUser.rows.length > 0) {
          return resHandler.badRequestError(
            res,
            "A user with your email already currently exists"
          );
        }
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
        console.log(err);
        return resHandler.executingQueryError(res, err);
      } finally {
        userClient.release();
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "signupUser");
    }
  }

  async updateUser(req, res) {
    const { newUsername, newEmail } = req.body;
    const { userId } = req.user;
    if (!newUsername && !newEmail) {
      return resHandler.badRequestError(
        res,
        "You did not provide an updated username or email. Please change at least one field to complete your update"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const updateQuery = userQueries[8];
        const updatedUser = await userClient.query(updateQuery, [
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
        return resHandler.executingQueryError(res, err);
      } finally {
        userClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "updateUser");
    }
  }

  async updateUserPassword(req, res) {
    const { newPassword } = req.body;
    const { userId } = req.user;
    if (!newPassword) {
      return resHandler.badRequestError(
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
      const userClient = await pool.connect();
      try {
        const updateQuery = userQueries[9];
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        if (!hashedPassword) {
          return resHandler.serverError(
            res,
            "Something went wrong creating your new password. Please try updating it again"
          );
        }
        const newUpdatedUser = await userClient.query(updateQuery, [
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
        return resHandler.executingQueryError(res, err);
      } finally {
        userClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "updateUserPassword");
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
      const userClient = await pool.connect();
      try {
        const deleteUserQuery = userQueries[10];
        const deletedUser = await userClient.query(deleteUserQuery, [userId]);
        if (deletedUser.rows < 1) {
          return resHandler.serverError(
            res,
            "There was a problem deleting your account, Please try again later"
          );
        }
        return resHandler.successResponse(
          res,
          "Your account was successfully deleted",
          null
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        userClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "updateUserPassword");
    }
  }
}

export default UserController;
