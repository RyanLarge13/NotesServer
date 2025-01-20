import express from "express";
import auth from "../auth/authenticate.js";
import ShareController from "../controllers/shareNotesController.js";

const shareRouter = express.Router();
const shareController = new ShareController();

shareRouter.post("/create", auth, shareController.createShare);
shareRouter.post("/remove", auth, shareController.removeShare);
shareRouter.post("/create/request", auth, shareController.createShareReq);
shareRouter.delete(
  "/remove/request/:sharereqid",
  auth,
  shareController.removeShareReq
);

export default shareRouter;
