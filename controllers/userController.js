import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";
import bcryptjs from "bcryptjs";
import signUser from "../auth/signUser.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import FormatData from "../utils/FormatData.js";
import {
  sendAdminEmailUserCreateDelete,
  sendChangePasswordEmail,
  sendPasswordReqEmail,
  sendWelcomeEmail,
} from "../utils/sendMail.js";
import { searchCountry } from "../utils/countries.js";

const resHandler = new ResponseHandler();
const formatter = new FormatData();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const userQueriesPath = path.join(__dirname, "../sql/userQueries.sql");

const userQueries = fs.readFileSync(userQueriesPath, "utf-8").split(";");

function generateRandomPassword(length) {
  const specialChars =
    "!@#$%^&*()_+-ABCDEFGHIJKL=[]{}|;:,.<>?MNOPQRSTUVWXYZabcdefghijklvwxyz0123456789mnopqrstu";

  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * specialChars.length);
    password += specialChars.charAt(randomIndex);
  }

  return password;
}

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

  async getUserDataSeperated(req, res) {
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
        const userData = await userClient.query(userQueries[2], [userId]);
        if (userData.rows.length === 0) {
          return resHandler.notFoundError(
            res,
            "No user was found in out records with your credentials, please try to login again"
          );
        }
        const formattedData = formatter.toSeperatedObj(userData.rows);
        return resHandler.successResponse(
          res,
          "Successfully fetched users information",
          formattedData
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
            "No user with these credentials was found with the username and email that were provided, Please try to login again"
          );
        }
        const userData = user.rows[0];
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
    const { username, email, password } = req.body;
    const ip = req.clientIp;
    if (!username || !email || !password) {
      return resHandler.badRequestError(
        res,
        "You must fill out all form data to create a new account"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const existingUser = await userClient.query(userQueries[12], [email]);
        if (existingUser.rows.length > 0) {
          return resHandler.badRequestError(
            res,
            "A user with your email already currently exists"
          );
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        if (!hashedPassword) {
          return resHandler.serverError(
            res,
            "Something went wrong on the server processing your request, we apologize for the inconvenience. Please reload the app and try again"
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
        await sendWelcomeEmail(email, username, password);
        const country = searchCountry(ip);
        await sendAdminEmailUserCreateDelete(email, username, country, true);
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
    const { oldPassword, newPassword } = req.body;
    const { userId, email, username } = req.user;
    if (!newPassword) {
      return resHandler.badRequestError(
        res,
        "Please provide a new password to update your account"
      );
    }
    if (!oldPassword) {
      return resHandler.badRequestError(
        res,
        "You must include your old password for security purposes"
      );
    }
    if (!userId) {
      return resHandler.authError(
        res,
        "Something went wrong while authenticating your request, please try updating your password again"
      );
    }
    try {
      const userClient = await pool.connect();
      try {
        const checkUserPassQuery = userQueries[0];
        const updateQuery = userQueries[9];
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        if (!hashedPassword) {
          return resHandler.serverError(
            res,
            "Something went wrong creating your new password. Please try updating it again"
          );
        }
        const currentUser = await userClient.query(checkUserPassQuery, [
          userId,
        ]);
        if (currentUser.rows.length < 0) {
          return resHandler.serverError(
            res,
            "We apologize for not being able to securely update your password at the moment. Please give us some time and try again in a few seconds. If the issue persists please contact the developer at ryan@ryanlarge.dev"
          );
        }
        const passwordMatches = await bcryptjs.compare(
          oldPassword,
          currentUser.rows[0].password
        );
        if (passwordMatches) {
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
          sendChangePasswordEmail(email, username, newPassword);
          return resHandler.successResponse(
            res,
            "Your new password is officially set",
            null
          );
        }
        return resHandler.badRequestError(
          res,
          "You must provide the correct password that you have in your account currently before you can set a new one"
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

  async forgotCreds(req, res) {
    const email = req.body.email;
    const userClient = await pool.connect();
    const existingUser = await userClient.query(userQueries[12], [email]);
    if (existingUser.rows.length > 0) {
      const randomCharacters = generateRandomPassword(10);
      const tempPass = await bcryptjs.hash(randomCharacters, 10);
      const updatedPassword = await userClient.query(userQueries[13], [
        email,
        tempPass,
      ]);
      if (updatedPassword.rows.length > 0) {
        sendPasswordReqEmail(
          email,
          updatedPassword.rows[0].username,
          randomCharacters
        );
        return resHandler.successResponse(
          res,
          "An email was sent to your account with your credentials",
          null
        );
      }
      return resHandler.serverError(
        res,
        "There was a problem on our end trying to help you reset your password, please try again later after giving us a few minutes to fix the issue. Email the developer at ryan@ryanlarge.dev"
      );
    }
    return resHandler.badRequestError(
      res,
      "your email is note associated with an account. Please signup and create an account or check your email and try the request again"
    );
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
