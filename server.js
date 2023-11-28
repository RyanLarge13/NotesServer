import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import parser from "body-parser";
// routers
import userRouter from "./routes/userRoutes.js";
import notesRouter from "./routes/notesRoutes.js";
import foldersRouter from "./routes/foldersRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.DEPLOYMENT === "dev" ? 8080 : 8080;

app.use(parser.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/notes", notesRouter);
app.use("/folders", foldersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
