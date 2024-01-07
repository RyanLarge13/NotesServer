import ResponseHandler from "../utils/ResponseHandler.js";
import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";

const resHandler = new ResponseHandler();
const validator = new Validator();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const notesQueriesPath = path.join(__dirname, "../sql/notesQueries.sql");
const trashQueriesPath = path.join(__dirname, "../sql/trashQueries.sql");
const notesQueries = fs.readFileSync(notesQueriesPath, "utf-8").split(";");
const trashQueries = fs.readFileSync(trashQueriesPath, "utf-8").split(";");

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

  async updateAusersNotesPosition(req, res) {}

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
          return resHandler.serverError(
            res,
            "There was a problem updating your note. Please give us some time to fix the problem and try again in a few seconds"
          );
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
        //const createTrashQuery = trashQueries[2];
        //const createTrash = await notesClient.query(createTrashQuery,[])
        const deletedNote = await notesClient.query(query, [noteId]);
        if (deletedNote.rows < 1) {
          return resHandler.serverError(
            res,
            "There was a problem deleting your account, Please try again later"
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
      return resHandler.connectionError(res, err, "deleteAUsersNote");
    }
  }
}

export default NotesController;
