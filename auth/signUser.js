import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

const signUser = (user) => {
  const token = jwt.sign(user, process.env.JWT_SWCRET);
  return token;
};

export default signUser;
