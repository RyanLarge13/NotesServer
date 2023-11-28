import jwt from "jsonwebtoken";

const signUser = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET);
  return token;
};

export default signUser;
