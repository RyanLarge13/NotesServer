import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const signUser = (user) => {
  const token = jwt.sign(user, process.env.JWT_TOKEN);
  return token;
};

export default signUser;
