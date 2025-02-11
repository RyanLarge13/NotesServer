import { fileURLToPath } from "url";
import ResponseHandler from "../utils/ResponseHandler.js";
import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";
import {
  checkForExistingConnection,
  checkForExistingShare,
  checkForExistingShareRequest,
} from "../utils/helpers.js";

const resHandler = new ResponseHandler();
const validator = new Validator();

const __filename = fileURLToPath(import.meta.url); // Correctly convert the URL to a path
const __dirname = path.dirname(__filename);

const notesQueriesPath = path.join(__dirname, "../sql/notesQueries.sql");
const notesQueries = fs.readFileSync(notesQueriesPath, "utf-8").split(";");

class NotesController {
  async getuserNotes(req, res) {
    const { userId } = req.user;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    try {
      const notesClient = await pool.connect();
      try {
        const query = notesQueries[0];
        const allUserNotes = await notesClient.query(query, [userId]);
        if (allUserNotes.rows < 1) {
          return resHandler.notFoundError(
            res,
            "No notes were retrieved for your account. Get started by creating one!"
          );
        }
        return resHandler.successResponse(
          res,
          "Successfully found your notes",
          allUserNotes.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        notesClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "getUserNotes");
    }
  }

  async createAUsersNote(req, res) {
    const { userId } = req.user;
    const { title, htmlNotes, folderId, locked } = req.body;
    const validArray = [
      validator.validateString(title),
      // validator.validateHtml(htmlNotes),
      //validator.validateId(folderId),
    ];
    const allValid = validator.validateArray(validArray);
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    if (!allValid.valid) {
      return resHandler.badRequestError(res, allValid.error);
    }
    try {
      const notesClient = await pool.connect();
      try {
        const query = notesQueries[4];
        const newNote = await notesClient.query(query, [
          userId,
          title,
          htmlNotes,
          locked,
          folderId,
        ]);
        if (newNote.rows < 1) {
          return resHandler.serverError(
            res,
            "There was a problem creating your new note"
          );
        }
        return resHandler.successCreate(
          res,
          "Successfully created your new note",
          newNote.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        notesClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "getUserNotes");
    }
  }

  async updateAUsersNotesPosition(req, res) {}

  async updateAUsersNote(req, res) {
    const { userId } = req.user;
    const { notesId, title, htmlNotes, locked, folderId } = req.body;
    const validArray = [
      validator.validateId(notesId),
      validator.validateString(title),
      //validator.validateHtml(htmlNotes),
    ];
    const allValid = validator.validateArray(validArray);
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    if (!allValid.valid) {
      return resHandler.badRequestError(res, allValid.error);
    }
    try {
      const notesClient = await pool.connect();
      try {
        const query = notesQueries[5];
        const noteUpdate = await notesClient.query(query, [
          userId,
          notesId,
          title,
          htmlNotes,
          locked,
          folderId,
        ]);
        if (noteUpdate.rows.length < 1) {
          if (!checkForExistingShare(notesClient, notesId, userId)) {
            return resHandler.badRequestError(
              res,
              "You are not authorized to update this note"
            );
          } else {
            try {
              const sharedNoteUpdated = await notesClient.query(
                notesQueries[13],
                [notesId, title, htmlNotes, locked, folderId]
              );

              if (sharedNoteUpdated.rows.length < 1) {
                return resHandler.serverError(
                  res,
                  "There was a problem updating your shared note. Please give us some time to fix the problem and try again in a few seconds"
                );
              } else {
                return resHandler.successResponse(
                  res,
                  "Successfully updated your shared note",
                  noteUpdate.rows
                );
              }
            } catch (err) {
              return resHandler.serverError(
                res,
                "There was a problem updating your note. Please give us some time to fix the problem and try again in a few seconds"
              );
            }
          }
        }
        return resHandler.successResponse(
          res,
          "Successfully updated your note",
          noteUpdate.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        notesClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "deleteAUsersNote");
    }
  }

  async moveNoteToTrash(req, res) {
    const { userId } = req.user;
    const { noteId, trashedBool } = req.body;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    const validId = validator.validateString(noteId);
    const validTrashBool = validator.validateBool(trashedBool);
    if (!noteId || !validTrashBool || !validId) {
      return resHandler.badRequestError(res, validId.error);
    }
    try {
      const notesClient = await pool.connect();
      try {
        const query = notesQueries[11];
        const movedNote = await notesClient.query(query, [
          userId,
          noteId,
          trashedBool,
        ]);
        if (movedNote.rows < 1) {
          return resHandler.serverError(
            res,
            `There was a problem ${
              trashedBool ? "trashing" : "moving"
            } your note, Please try again later`
          );
        }
        return resHandler.successResponse(
          res,
          `Your note was successfully ${
            trashedBool
              ? "sent to the trash"
              : "your not was successfully moved to your folders"
          }`,
          movedNote.rows
        );
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(res, err);
      } finally {
        notesClient.release();
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "moveNoteToTrash");
    }
  }

  async deleteAUsersNote(req, res) {
    const { userId } = req.user;
    const { noteId } = req.params;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    const validId = validator.validateString(noteId);
    if (!noteId || !validId) {
      return resHandler.badRequestError(res, validId.error);
    }
    try {
      const notesClient = await pool.connect();
      try {
        const query = notesQueries[7];
        const deletedNote = await notesClient.query(query, [userId, noteId]);
        if (deletedNote.rows < 1) {
          return resHandler.serverError(
            res,
            "There was a problem deleting your note, Please try again later"
          );
        }
        return resHandler.successResponse(
          res,
          "Your note was successfully deleted",
          deletedNote.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        notesClient.release();
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "deleteAUsersNote");
    }
  }

  async favoriteNote(req, res) {
    const { userId } = req.user;
    const { notesId, favorite } = req.body;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    const validId = validator.validateString(notesId);
    const validTrashBool = validator.validateBool(favorite);
    if (!notesId || !validTrashBool || !validId) {
      return resHandler.badRequestError(res, validId.error);
    }
    try {
      const notesClient = await pool.connect();
      try {
        const query = notesQueries[12];
        const favoredNote = await notesClient.query(query, [
          userId,
          notesId,
          favorite,
        ]);
        if (favoredNote.rows < 1) {
          return resHandler.serverError(
            res,
            `There was a problem ${
              favorite ? "favoring" : "un-favoring"
            } your note, Please try again later`
          );
        }
        return resHandler.successResponse(
          res,
          `Your note was successfully ${
            favorite ? "favored" : "un-favored from your list"
          }`,
          favoredNote.rows
        );
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(res, err);
      } finally {
        notesClient.release();
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "favoriteNote");
    }
  }

  async fetchASingleNote(req, res) {
    const { userId } = req.user;
    const noteId = req.params.noteid;

    if (!userId) {
      return resHandler.authError(
        res,
        "You are not authorized to make this request"
      );
    }
    if (!noteId) {
      return resHandler.badRequestError(
        res,
        "Please provide the note you want to fetch data for"
      );
    }

    try {
      const poolCon = await pool.connect();
      try {
        const noteQuery = notesQueries[10];
        const note = await poolCon.query(noteQuery, [noteId]);

        if (note.rows.length < 1) {
          return resHandler.badRequestError(
            res,
            "There was a problem fetching this notes information, it is possible it has recently been deleted"
          );
        }

        const noteUser = note.rows[0].userid;
        if (noteUser === userId) {
          return resHandler.successResponse(
            res,
            "Successfully fetched your note",
            { note: note.rows[0] }
          );
        } else {
          const shareReqExists = await checkForExistingShareRequest(
            poolCon,
            userId,
            note.rows[0].userid,
            noteId
          );
          if (!shareReqExists) {
            const connectionExists = await checkForExistingConnection(
              poolCon,
              userId,
              noteUser,
              res
            );
            if (!connectionExists) {
              return resHandler.badRequestError(
                res,
                "You are not authorized access to this notes information. Perhaps this note is no longer being shared with you"
              );
            } else {
              return resHandler.successResponse(
                res,
                "Shared note data successfully received",
                { note: note.rows[0] }
              );
            }
          } else {
            return resHandler.successResponse(
              res,
              "Shared note data successfully received",
              { note: note.rows[0] }
            );
          }
        }
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(
          res,
          "There was a problem with your request, please try again"
        );
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "fetchASingleNote");
    }
  }

  async lockOrUnlockANote(req, res) {
    const { userId } = req.user;
    const { noteId, lock } = req.body;

    if (!userId) {
      return resHandler.authError(
        res,
        "You are not authorized to make this request. Please log in and try again"
      );
    }
    if (!noteId || typeof lock !== "boolean") {
      return resHandler.badRequestError(
        res,
        "Something went wrong with your request. Please make sure you are trying to update a valid note"
      );
    }

    try {
      const poolConnection = await pool.connect();
      try {
        const query = notesQueries[14];
        const updatedNote = await poolConnection.query(query, [
          noteId,
          lock,
          userId,
        ]);
        if (updatedNote.rows.length < 1) {
          return resHandler.badRequestError(
            res,
            "There was an issue processing your request. Please try to update your note again"
          );
        }
        return resHandler.successResponse(
          res,
          `Successfully ${lock ? "locked" : "unlocked"} your note`,
          { note: updatedNote.rows[0] }
        );
      } catch (err) {
        console.log(
          `Error running query in lockOrUnlockANote @line: 435. Error: ${err}`
        );
        return resHandler.serverError(
          res,
          "There was a problem on our server. Please try the request again and if the issue persists contact the developer"
        );
      }
    } catch (err) {
      console.log(
        `Error connecting to pool in lockOrUnlockANote @line: 427. Error: ${err}`
      );
      return resHandler.serverError(
        res,
        "There was a problem on our server. Please try the request again and if the issue persists contact the developer"
      );
    }
  }
}

export default NotesController;
