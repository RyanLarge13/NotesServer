import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ResponseHandler from "../utils/ResponseHandler.js";
dotenv.config();

const resHandler = new ResponseHandler();

const auth = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  if (token == null)
    return resHandler.authError(
      res,
      "You are not authorized, Please login again"
    );
  jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
    if (err) {
      return resHandler.authError(
        res,
        "You are not authorized, Please login again"
      );
    }
    req.user = user;
    next();
  });
};

export default auth;
