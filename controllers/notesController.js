import ResponseHandler from "../utils/ResponseHandler.j";
import Validator from "../utils/ValidateData";
import pool from "../utils/dbConnection";

const resHandler = new ResponseHandler();
const validator = new Validator();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const notesQueriesPath = path.join(__dirname, "../sql/notesQueries.sql");
const notesQueries = fs.readFileSync(notesQueriesPath, "utf-8").split(";");
class notesController {
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
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "getUserNotes");
    }
  }

  async createAUsersNote(req, res) {
    const { userId } = req.user;
    const { title, htmlNotes, folderId } = req.body;
    const validArray = [
      validator.validateString(title),
      validator.validateHtml(htmlNotes),
      validator.validateId(folderId),
    ];
    // const allValidInputs = validArray.every((bool) => bool.valid === true);
    const allValid = Validator.validateArray(validArray);
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    if (!allValid.valid) {
      return resHandler.badRequestError(
        res,
        `Please input correct values for creating a note. ${allValid.data} is not a valid input`
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
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "getUserNotes");
    }
  }

  async updateAusersNotesPosition(req, res) {}

  async updateAUsersNote(req, res) {
    const { userId } = req.user;
    const { notesId, title, htmlNotes } = req.body;
    const validArray = [
      validator.validateId(notesId),
      validator.validateString(title),
      validator.validateHtml(htmlNotes),
    ];
    const allValid = validator.validateArray(validArray);
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    if (!allValid.valid) {
      return resHandler.badRequestError(
        res,
        `Please send valid data to update your note. ${allValid.data} is not a valid field`
      );
    }
  }

  async deleteAUsersNote(req, res) {
    const { userId } = req.user;
    const { noteId } = req.body;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    const validId = validator.validateId(noteId);
    if (!noteId || !validId) {
      return resHandler.badRequestError(
        res,
        "Please specify what note you would like to delete"
      );
    }
    try {
      const notesClient = await pool.connect();
      try {
        const query = notesQueries[7];
        const deletedNote = await notesClient.query(query, [noteId]);
        if (deletedNote.rows < 1) {
          return resHandler.serverError(
            res,
            "There was a problem deleting your account, Please try again later"
          );
        }
        return resHandler.successResponse(res, message, deletedNote.rows[0]);
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "deleteAUsersNote");
    }
  }
}

export default notesController;
