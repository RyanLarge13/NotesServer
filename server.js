import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import parser from "body-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// routers
import userRouter from "./routes/userRoutes.js";
import notesRouter from "./routes/notesRouter.js";
import foldersRouter from "./routes/foldersRouter.js";
import conRouter from "./routes/connectionsRouter.js";
import shareROuter from "./routes/shareRouter.js";
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 8080;
const assetsPath = path.join(__dirname, "assets");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(cors());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use("/users", userRouter);
app.use("/notes", notesRouter);
app.use("/folders", foldersRouter);
app.use("/connect", conRouter);
app.use("/share", shareROuter);
app.use("/assets", express.static(assetsPath));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
