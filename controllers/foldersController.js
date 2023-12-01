import ResponseHandler from "../utils/ResponseHandler.j";
import Validator from "../utils/ValidateData";
import pool from "../utils/dbConnection";

const resHandler = new ResponseHandler();
const validator = new Validator();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const foldersQueriesPath = path.join(__dirname, "../sql/foldersQueries.sql");
const foldersQueries = fs.readFileSync(foldersQueriesPath, "utf-8").split(";");

class foldersController {
  async getAllUserFolders(req, res) {
    const { userId } = req.user;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    try {
      const foldersClient = await pool.connect();
      try {
        const query = foldersQueries[0];
        const allFolders = await foldersClient.query(query, [userId]);
        if (allFolders.rows.length < 1) {
          return resHandler.notFoundError(
            res,
            "You have no folders. Create a new one now!"
          );
        }
        return resHandler.successResponse(
          res,
          "Successfully found your folders",
          allFolders.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "getAllUserFolders");
    }
  }
  async createFolder(req, res) {
    const { userId } = req.user;
    const { title, color, parentFolderId } = req.body;
    if (!title || !color) {
      return resHandler.badRequestError(
        res,
        "You must provide a title and a color for your folder"
      );
    }
    const validArray = parentFolderId
      ? [
          validator.validateString(title),
          validator.validateString(color),
          validator.validateId(parentFolderId),
        ]
      : [validator.validateString(title), validator.validateString(color)];
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
      const foldersClient = await pool.connect();
      try {
        const query = foldersQueries[4];
        const newFolder = await foldersClient.query(query, [
          userId,
          title,
          color,
          parentFolderId,
        ]);
        if (newFolder.rows.length < 1) {
          return resHandler.serverError(
            res,
            "There was a problem with the server when attempting to creating your new folder, give us some time to fix the issue and try again"
          );
        }
        return resHandler.successCreate(
          res,
          "Successfully created your new folder",
          newFolder.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "createFolder");
    }
  }

  async updateFolderPosition(req, res) {}

  async updateFolderInfo(req, res) {
    const { userId } = req.user;
    const { title, color } = req.body;
    if (!title && !color) {
      return resHandler.badRequestError(
        res,
        "You need to at least provide one field to update on your folder"
      );
    }
    const validArray =
      title && !color
        ? [validator.validateString(title)]
        : color && !title
        ? [validator.validateString(color)]
        : [validator.validateString(title), validator.validateString(color)];
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
      const foldersClient = await pool.connect();
      try {
        const query = foldersQueries[5];
        const update = foldersClient.query(query, [userId, title, color]);
        if (update.rows.length < 1) {
          return res.serverError(
            res,
            "Something went wrong updating your folder, please give us some time and try again in a few seconds"
          );
        }
        return resHandler.successResponse(
          res,
          "Successfully updated your folder",
          update.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "updateFolderInfo");
    }
  }

  async deleteFolder(req, res) {
    const { userId } = req.user;
    const { folderId } = req.body;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    const validId = validator.validateId(folderId);
    if (!validId.valid) {
      return badRequestError(
        res,
        "Please provide a valid folder identification to delete it"
      );
    }
    try {
      const foldersClient = await pool.connect();
      try {
        const query = foldersQueries[8];
        const deletedFolder = await foldersClient.query(query, [
          userId,
          folderId,
        ]);
        if (deletedFolder.rows.length < 1) {
          return resHandler.serverError(
            res,
            "Something Went wrong deleting your folder. Please give us some time to fix the issue and try deleting your folder again in a few seconds"
          );
        }
        return resHandler.successResponse(res,"Successfully deleted your folder", deletedFolder.rows)
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "deleteFolder");
    }
  }
}

export default foldersController;
