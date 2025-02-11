import { fileURLToPath } from "url";
import ResponseHandler from "../utils/ResponseHandler.js";
import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";
import { checkForExistingShare } from "../utils/helpers.js";

const resHandler = new ResponseHandler();
// const validator = new Validator();

const __filename = fileURLToPath(import.meta.url); // Correctly convert the URL to a path
const __dirname = path.dirname(__filename);

const shareQueryPath = path.join(__dirname, "../sql/shareQueries.sql");
const shareQueries = fs.readFileSync(shareQueryPath, "utf-8").split(";");

async function findUser(shareClient, toEmail, res) {
  const findUserQuery = shareQueries[0];
  try {
    const foundUser = await shareClient.query(findUserQuery, [toEmail]);
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

async function findNote(shareClient, noteId, userId, res) {
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

async function checkConnection(shareClient, otherUserId, userId, res) {
  const connectionQuery = shareQueries[2];
  try {
    const connection = await shareClient.query(connectionQuery, [
      otherUserId,
      userId,
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

async function checkForShareRequest(shareClient, shareReqId, res) {
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

async function checkForShareRequestWithoutId(
  shareClient,
  userOneId,
  userTwoId,
  noteid
) {
  const shareReqQuery = shareQueries[8];
  try {
    const req = await shareClient.query(shareReqQuery, [
      userOneId,
      userTwoId,
      noteid,
    ]);
    if (req.rows.length < 1) {
      return { found: false, data: null, error: false };
    } else {
      return { found: true, data: req.rows[0], error: false };
    }
  } catch (err) {
    console.log(
      `Error finding share request calling checkForShareRequestWithoutId. Error: ${err}`
    );
    return { found: false, data: null, error: true };
  }
}

class ShareController {
  constructor() {}

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
      const shareClient = await pool.connect();
      try {
        const toEmailExists = await findUser(shareClient, toEmail, res);
        if (toEmailExists.error) return;
        if (!toEmailExists.found) {
          return resHandler.badRequestError(
            res,
            "No user with that email exists in our database. Please make sure you are submitting the correct email for sharing your note."
          );
        }
        const noteExists = await findNote(
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
        const shareReqAlreadyExists = await checkForShareRequestWithoutId(
          shareClient,
          toEmailExists.data.userid,
          user.userId,
          note.noteid
        );
        if (shareReqAlreadyExists.error) {
          return resHandler.serverError(
            res,
            "We ran into trouble querying your data. Please try gain and if the issue persists, contact the developer"
          );
        }

        if (shareReqAlreadyExists.found) {
          return resHandler.badRequestError(
            res,
            "You are already attempting to share this note with that user"
          );
        }

        const createShareReqQuery = shareQueries[3];
        const newShareRequest = await shareClient.query(createShareReqQuery, [
          toEmailExists.data.userid,
          user.userId,
          noteExists.data.notesid,
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
    const shareId = req.params.sharereqid;
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
      const shareRequestExists = await checkForShareRequest(
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
        if (deletedReq.rows.length < 1) {
          return resHandler.serverError(
            res,
            "There was a problem on the server canceling your share request. Please try again, if the issue persists contact the developer at ryanlarge@ryanlarge.dev"
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
    try {
      const shareClient = await pool.connect();
      try {
        const existingReq = await checkForShareRequest(
          shareClient,
          shareId,
          res
        );
        if (existingReq.error) return;
        if (existingReq.found) {
          return resHandler.badRequestError(
            res,
            "You already are sharing this note with another user"
          );
        }
        const newShareQuery = shareQueries[6];
        const newShare = await shareClient.query(newShareQuery, [
          existingReq.data.reqtoid,
          existingReq.data.reqfromid,
          existingReq.data.notetoshareid,
        ]);
        await shareClient.query(shareQueries[5], [existingReq.data.reqid]);
        if (newShare.rows.length < 1) {
          return resHandler.serverError(
            res,
            "We had an issue creating the new connection for sharing this note. Please try again, and if the issue persists, contact the developer at rynalarge@ryanlareg.dev"
          );
        }
        return resHandler.successCreate(
          res,
          "You and your connection can now successfully collaborate on this note",
          newShare.rows[0]
        );
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(
          res,
          `There was a problem accepting this note`
        );
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "removeShareReq");
    }
  }

  async removeShare(req, res) {
    const user = req.user;
    const shareId = req.params.shareId;
    if (!user) {
      return resHandler.authError(
        res,
        "You are not authorized to remove this note. Please login and try again"
      );
    }
    if (!shareId) {
      return resHandler.badRequestError(
        res,
        "Please provide us with a valid note to remove from sharing"
      );
    }
    try {
      const shareClient = await pool.connect();
      try {
        const shareExists = await checkForExistingShare(
          shareClient,
          shareId,
          user.userId
        );
        if (!shareExists.found || shareExists.error) {
          return resHandler.badRequestError(
            res,
            "You must provide us with a valid shared note to remove this connection"
          );
        }
        const removeShareQuery = shareQueries[7];
        const deletedShare = await shareClient.query(removeShareQuery, [
          shareExists.data.sharednoteid,
        ]);
        if (deletedShare.rows.length < 1) {
          return resHandler.serverError(
            res,
            "There was a problem removing the shared connection with this note. Please try again and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
          );
        }
        return resHandler.successResponse(
          res,
          "You have successfully disconnected from sharing this note. You still have access to this note without sharing capabilities",
          null
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
}

export default ShareController;
