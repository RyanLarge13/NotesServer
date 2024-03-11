import express from "express";
import auth from "../auth/authenticate";
import { postNewShare } from "../controllers/shareNotesController.js";

const shareNotesRouter = express.Router();

shareNotesRouter.post("/share/note", auth, postNewShare);

export default shareNotesRouter;
