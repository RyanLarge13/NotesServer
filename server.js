import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import parser from "body-parser";
// routers
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.DEPLOYMENT === "dev" ? 8080 : 8080;

app.use(parser.json());
app.use(cors());
app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
