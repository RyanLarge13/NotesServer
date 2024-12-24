import { fileURLToPath } from "url";
import ResponseHandler from "../utils/ResponseHandler.js";
import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import { addMultiFoldersAndNotes } from "../utils/helpers.js";
import fs from "fs";
import path from "path";

const resHandler = new ResponseHandler();
const validator = new Validator();

const __filename = fileURLToPath(import.meta.url); // Correctly convert the URL to a path
const __dirname = path.dirname(__filename);

// Queries to manipulate folder
const foldersQueriesPath = path.join(__dirname, "../sql/foldersQueries.sql");
const foldersQueries = fs.readFileSync(foldersQueriesPath, "utf-8").split(";");

class FoldersController {
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
      } finally {
        foldersClient.release();
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
          parentFolderId ? parentFolderId : null,
        ]);
        if (newFolder.rows.length < 1) {
          return resHandler.serverError(
            res,
            "There was a problem with the server when attempting to creating your new folder, give us some time to fix the issue and try again"
          );
        }
        const folderObj = newFolder.rows[0];
        const folderToSend = {
          foldertitle: folderObj.title,
          foldercolor: folderObj.color,
          folderid: folderObj.folderid,
          parentfolderid: folderObj.parentfolderid,
          folders: [],
          notes: [],
        };
        return resHandler.successCreate(
          res,
          "Successfully created your new folder",
          [folderToSend]
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        foldersClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "createFolder");
    }
  }

  async dupMultipleFolders(req, res) {
    const user = req.user;
    if (!user) {
      return resHandler.authError(
        res,
        "Please log in before trying to duplicate your content"
      );
    }
    const { newFolders, newNotes } = req.body;
    if (newFolders.length < 1) {
      return resHandler.badRequestError(
        res,
        "Please provide the folder and contents that you would like to duplicate"
      );
    }
    try {
      const foldersClient = await pool.connect();
      try {
        const firstFolder = await foldersClient.query(foldersQueries[4], [
          user.userId,
          newFolders[0].title,
          newFolders[0].color,
          newFolders[0].parentFolderId ? newFolders[0].parentFolderId : null,
        ]);
        if (firstFolder.rows.length < 1) {
          return resHandler.serverError(
            res,
            "We could not duplicate your content right now. We are terribly sorry. Please reload the application and try again. If the issue persists, contact the developer immediately at ryanlarge@ryanlarge.dev"
          );
        }
        const topLevelFolder = firstFolder.rows[0];
        const newFoldersArray = [];
        const newNotesArray = [];
        newFoldersArray.push(topLevelFolder);
        try {
          await addMultiFoldersAndNotes(
            user.userId,
            topLevelFolder.folderid,
            newFolders[0].folderid,
            newFolders,
            newNotes,
            foldersClient,
            newFoldersArray,
            newNotesArray
          );
        } catch (err) {
          console.log(err);
          return resHandler.executingQueryError(res, err);
        }
        if (newFoldersArray.length < 1) {
          return resHandler.serverError(
            "We are experiencing issues duplicating your content. Please reload the application and try again. If the issue continues to persist, contact the developer immediately at ryanlarge@ryanlarge.dev"
          );
        }
        return resHandler.successCreate(
          res,
          "Successfully duplicated your notes",
          { newFoldersArray, newNotesArray }
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        foldersClient.release();
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "dup multiple folders");
    }
  }

  async moveMultipleFolders(req, res) {
    const { userId } = req.user;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    const allFolders = req.body.folderArray;
    const newParentId = req.body.newParentId;
    if (allFolders.length === 0) {
      return resHandler.badRequestError(
        res,
        "You must provide at least 1 folder to update"
      );
    }
    try {
      const foldersClient = await pool.connect();
      try {
        const placeholders = allFolders
          .map((_, index) => `$${index + 3}`)
          .join(", ");
        const preUpdateManyQuery = foldersQueries[11];
        const updateManyQuery = preUpdateManyQuery.replace(
          "{folders}",
          placeholders
        );
        const updatedFolders = await foldersClient.query(updateManyQuery, [
          userId,
          newParentId,
          ...allFolders,
        ]);
        if (updatedFolders.rows.length !== allFolders.length) {
          return resHandler.executingQueryError(res, err);
        }
        return resHandler.successResponse(
          res,
          "Successfully moved all folders",
          { folders: updatedFolders }
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        foldersClient.release();
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "updateFolderInfo");
    }
  }

  async updateFolderInfo(req, res) {
    const { userId } = req.user;
    const { parentFolderId, title, color, folderId } = req.body;
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
        const update = await foldersClient.query(query, [
          userId,
          folderId,
          parentFolderId,
          title,
          color,
        ]);
        if (update.rows.length < 1) {
          return resHandler.serverError(
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
      } finally {
        foldersClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "updateFolderInfo");
    }
  }

  async deleteFolder(req, res) {
    const { userId } = req.user;
    const { folderId } = req.params;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    const validId = validator.validateString(folderId);
    if (!validId.valid) {
      return resHandler.badRequestError(
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
        return resHandler.successResponse(
          res,
          "Successfully deleted your folder",
          deletedFolder.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        foldersClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "deleteFolder");
    }
  }

  async deleteMultipleFolders(req, res) {
    const { userId } = req.user;
    const { folderIds } = req.body;
    if (!userId) {
      return resHandler.authError(
        res,
        "Please try to login again there was a problem authenticating who you are"
      );
    }
    // const validId = validator.validateString(folderIds[0]);
    // if (!validId.valid) {
    //   return resHandler.badRequestError(
    //     res,
    //     "Please provide a valid folder identification to delete it"
    //   );
    // }
    try {
      const foldersClient = await pool.connect();
      try {
        const query = foldersQueries[9];
        const deletedFolder = await foldersClient.query(query, [
          userId,
          folderIds,
        ]);
        // if (deletedFolder.rows.length < 1) {
        //   return resHandler.serverError(
        //     res,
        //     "Something Went wrong deleting your folder. Please give us some time to fix the issue and try deleting your folder again in a few seconds"
        //   );
        // }
        return resHandler.successResponse(
          res,
          "Successfully deleted your folder",
          deletedFolder.rows
        );
      } catch (err) {
        return resHandler.executingQueryError(res, err);
      } finally {
        foldersClient.release();
      }
    } catch (err) {
      return resHandler.connectionError(res, err, "deleteFolder");
    }
  }
}

export default FoldersController;
