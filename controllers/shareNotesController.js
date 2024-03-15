import ResponseHandler from "../utils/ResponseHandler.js";
import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";

const resHandler = new ResponseHandler();
const validator = new Validator();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const shareQueryPath = path.join(__dirname, "../sql/shareQueries.sql");
const shareQueries = fs.readFileSync(shareQueryPath, "utf-8").split(";");

class ShareController {
 constructor() {}

 async findUser(shareClient, toEmail, res) {
  const findUserQuery = shareQueries[0];
  try {
   const foundUser = shareClient.query(findUserQuery, [toEmail]);
   if (foundUser.rows.length < 1) {
    return { found: false, data: null, error: false };
   }
   return { found: true, data: foundUser.rows[0], error: false };
  } catch (err) {
   console.log(err);
   resHandler.executingQueryError(
    res,
    "There was a problem on the server. Please try to make your request again and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
   );
   return { found: false, data: null, error: true };
  }
 }

 async findNote(shareClient, noteId, userId, res) {
  const findNoteQuery = shareQueries[1];
  try {
   const foundNote = await shareClient.query(findNoteQuery, [noteId, userId]);
   if (foundNote.rows.length < 1) {
    return { found: false, data: foundNote.rows[0], error: false };
   }
   return { found: true, data: foundNote.rows[0], error: false };
  } catch (err) {
   console.log(err);
   resHandler.executingQueryError(
    res,
    "There was a problem on the server. Please try to make your request again and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
   );
   return { found: false, data: null, error: true };
  }
 }

 async checkConnection(shareClient, otherUserId, userId, res) {
  const connectionQuery = shareQueries[2];
  try {
   const connection = await shareClient.query(connectionQuery, [
    otherUserId,
    userId
   ]);
   if (connection.rows.length < 1) {
    return { found: false, data: null, error: false };
   }
   return { found: true, data: connection.rows[0], error: false };
  } catch (err) {
   resHandler.executingQueryError(
    res,
    "There was a problem on the server. Please try to make your request again and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
   );
   return { found: false, data: null, error: true };
  }
 }

 async checkForShareRequest(shareClient, shareReqId, res) {
  const shareReqQuery = shareQueries[4];
  try {
   const shareReqExists = await shareClient.query(shareReqQuery, [shareReqId]);
   if (shareReqExists.rows.length < 1) {
    return { found: false, data: null, error: false };
   }
   return { found: true, data: shareReqExists.rows[0], error: false };
  } catch (err) {
   console.log(err);
   resHandler.executingQueryError(
    res,
    "There was a problem on the server. Please try to make your request again and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
   );
   return { found: false, data: null, error: true };
  }
 }

 async createShareReq(req, res) {
  const user = req.user;
  const { toEmail, note } = req.body;
  if (!user) {
   return resHandler.authError(
    res,
    "You are not authorized to share this note. Please login again"
   );
  }
  if (!toEmail || !note) {
   return resHandler.badRequestError(
    res,
    "You must provide a valid email, and note to share it with your connections"
   );
  }
  try {
   try {
    const shareClient = await pool.connect();
    const toEmailExists = await this.findUser(shareClient, toEmail, res);
    if (toEmailExists.error) return;
    if (!toEmailExists.found) {
     return resHandler.badRequestError(
      res,
      "No user with that email exists in our database. Please make sure you are submitting the correct email for sharing your note."
     );
    }
    const noteExists = await this.findNote(
     shareClient,
     note.noteid,
     user.userId,
     res
    );
    if (noteExists.error) return;
    if (!noteExists.found) {
     return resHandler.badRequestError(
      res,
      "Please provide a valid note to share to one of your connections"
     );
    }
    const validConnection = await checkConnection(
     shareClient,
     toEmailExists.data.userid,
     user.userId,
     res
    );
    if (validConnection.error) return;
    if (!validConnection.found) {
     return resHandler.badRequestError(
      res,
      `You are not connected with
     ${toEmail}, send a connection request to this user if you know them first
     before sharing your notes`
     );
    }
    if (validConnection.found && !validConnection.data) {
     return resHandler.serverError(
      res,
      "We are having issues retrieving data from our records right now. Please, try to share this note again and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
     );
    }
    const createShareReqQuery = shareQueries[3];
    const newShareRequest = await shareClient.query(createShareReqQuery, [
     userId,
     toEmailExists.data.userid,
     noteExists.data.notesid
    ]);
    if (newShareRequest.rows.length < 1) {
     return resHandler.serverError(
      res,
      "We re terribly sorry but we could not initiate your request to share your note. Please try again. If the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
     );
    }
    return resHandler.successCreate(
     res,
     `You have successfully sent a request to share your note with ${toEmail}`,
     newShareRequest.rows[0]
    );
   } catch (err) {
    console.log(err);
    return resHandler.executingQueryError(res, err);
   }
  } catch (err) {
   console.log(err);
   return resHandler.connectionError(res, err, "createShareReq");
  }
 }

 async removeShareReq(req, res) {
  const user = req.user;
  const { shareId } = req.body;
  if (!user) {
   return resHandler.authError(
    res,
    "You are not authorized to make this request. Please log back in and try again"
   );
  }
  if (!shareId) {
   return resHandler.badRequestError(
    res,
    "You must provide the share request you wish to cancel"
   );
  }
  try {
   const shareClient = await pool.connect();
   const shareRequestExists = await this.checkForShareRequest(
    shareClient,
    shareId,
    res
   );
   if (shareRequestExists.error) {
    return;
   }
   if (!shareRequestExists.found) {
    return resHandler.badRequestError(
     res,
     "No request to share your note is in our records."
    );
   }
   try {
    const removeReqQuery = shareQueries[5];
    const deletedReq = await shareClient.query(removeReqQuery, [shareId]);
    if (deletedReq.rows.lemgth < 1) {
     return resHandler.serverError(
      res,
      "There was a problem on the server cancwlimg your share request. Please try again, if the issue persists contact the developer at ryanlarge@ryanlarge.dev"
     );
    }
    return resHandler.successResponse(
     res,
     "You have successfully canceled your request to share your note."
    );
   } catch (err) {
    console.log(err);
    return resHandler.executingQueryError(res, err);
   }
  } catch (err) {
   console.log(err);
   return resHandler.connectionError(res, err, "removeShareReq");
  }
 }

 async createShare(req, res) {
  const user = req.user;
  if (!user) {
   return resHandler.authError(
    res,
    "You are not authorized to accept this shared note. Please log back in and try again"
   );
  }
  const { shareId, fromEmail } = req.body;
  if (!shareId || !fromEmail) {
   return resHandler.badRequestError(
    res,
    "You must provide a valid share request to accept"
   );
  }
  //const existingReq = await
 }

 async removeShare(req, res) {
  const user = req.user;
  const { shareId } = req.body;
 }
}
