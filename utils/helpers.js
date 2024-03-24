import ResponseHandler from "../utils/ResponseHandler.js";
// import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";

const resHandler = new ResponseHandler();
// const validator = new Validator();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const conQueryPath = path.join(__dirname, "../sql/conQueries.sql");
const conQueries = fs.readFileSync(conQueryPath, "utf-8").split(";");

export const findRequesteesId = async (conClient, userEmail, res) => {
  try {
    const findUser = conQueries[0];
    const userFound = await conClient.query(findUser, [userEmail]);
    if (userFound.rows.length < 1) {
      // resHandler.badRequestError(
      //   res,
      //   "No user with this email exists within our system"
      // );
      return "";
    }
    return userFound.rows[0];
  } catch (err) {
    console.log(err);
    // resHandler.executingQueryError(res, err);
    return "";
  }
};

export const checkForExistingRequest = async (
  conClient,
  userId,
  requestUserId,
  res,
  returnData
) => {
  try {
    const existingReqQuery = conQueries[1];
    const existingReq = await conClient.query(existingReqQuery, [
      userId,
      requestUserId,
    ]);
    if (existingReq.rows.length < 1) {
      if (returnData) {
        return { exists: false, data: null };
      }
      return false;
    }
    // resHandler.badRequestError(
    //   res,
    //   "You have already sent this user a connection request"
    // );
    if (returnData) {
      return { exists: true, data: existingReq.rows[0] };
    }
    return true;
  } catch (err) {
    console.log(err);
    // resHandler.executingQueryError(res, err);
    if (returnData) {
      return { exists: true, data: null };
    }
    return true;
  }
};

export const checkForExistingConnection = async (
  conClient,
  userId,
  requestUserId,
  res
) => {
  const existingConQuery = conQueries[3];
  const existingCon = await conClient.query(existingConQuery, [
    userId,
    requestUserId,
  ]);
  if (existingCon.rows.length > 0) {
    // resHandler.badRequestError(
    //   res,
    //   "You already have an active connection with this user"
    // );
    return true;
  }
  return false;
};
