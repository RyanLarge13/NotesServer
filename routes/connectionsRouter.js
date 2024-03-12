import express from "express"

const conRouter = express.Router();

conRouter.post("/create");
conRouter.delete("/remove");

export default conRouter;