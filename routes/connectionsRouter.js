import express from "express";
import auth from "../auth/authenticate.js";
import ConController from "../controllers/connectionsController.js";

const conRouter = express.Router();
const conController = new ConController();

conRouter.post("/create", auth, conController.createConnection);
conRouter.delete("/remove", auth, conController.removeCon);
conRouter.post("/create/request", auth, conController.createReqCon);
conRouter.delete(
  "/remove/request/:conreqid",
  auth,
  conController.cancelExistingConnectionReq
);

export default conRouter;
