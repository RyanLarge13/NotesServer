import express from "express";
import auth from "../auth/authenticate.js";
import FoldersController from "../controllers/foldersController.js";

const foldersRouter = express.Router();
const foldersController = new FoldersController();

foldersRouter.get("/", auth, foldersController.getAllUserFolders);
foldersRouter.post("/create", auth, foldersController.createFolder);
foldersRouter.patch("/update", auth, foldersController.updateFolderInfo);
foldersRouter.delete("/delete/:folderId", auth, foldersController.deleteFolder);

export default foldersRouter;
