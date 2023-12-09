import express from "express";
import auth from "../auth/authenticate.js";
import NotesController from "../controllers/notesController.js";

const notesRouter = express.Router();
const notesController = new NotesController();

notesRouter.get("/", auth, notesController.getuserNotes);
notesRouter.post("/create", auth, notesController.createAUsersNote);
notesRouter.patch("/update", auth, notesController.updateAUsersNote);
notesRouter.delete("/delete/:noteId", auth, notesController.deleteAUsersNote);

export default notesRouter;
