import jwt from "jsonwebtoken";
import ResponseHandler from "../utils/ResponseHandler";

const resHandler = new ResponseHandler();

const auth = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  if (token == null)
    return resHandler.authError(
      res,
      "You are not authorized, Please login again"
    );
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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
