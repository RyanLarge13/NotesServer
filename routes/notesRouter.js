import express from "express";
import auth from "../auth/authenticate.js";
import NotesController from "../controllers/notesController.js";

const notesRouter = express.Router();
const notesController = new NotesController();

notesRouter.get("/", auth, notesController.getuserNotes);
notesRouter.get("/find/:noteid", auth, notesController.fetchASingleNote);
notesRouter.post("/create", auth, notesController.createAUsersNote);
notesRouter.patch("/update", auth, notesController.updateAUsersNote);
notesRouter.patch("/movetotrash", auth, notesController.moveNoteToTrash);
notesRouter.delete("/delete/:noteId", auth, notesController.deleteAUsersNote);
notesRouter.patch("/favorite", auth, notesController.favoriteNote);

export default notesRouter;
