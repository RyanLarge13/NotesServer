import { fileURLToPath } from "url";
import ResponseHandler from "../utils/ResponseHandler.js";
// import Validator from "../utils/ValidateData.js";
// import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";

// const resHandler = new ResponseHandler();
// const validator = new Validator();

const __filename = fileURLToPath(import.meta.url); // Correctly convert the URL to a path
const __dirname = path.dirname(__filename);

// Queries to manipulate folders
const foldersQueriesPath = path.join(__dirname, "../sql/foldersQueries.sql");
const foldersQueries = fs.readFileSync(foldersQueriesPath, "utf-8").split(";");
// Queries to manipulate notes
const notesQueriesPath = path.join(__dirname, "../sql/notesQueries.sql");
const notesQueries = fs.readFileSync(notesQueriesPath, "utf-8").split(";");
// Queries for connections
const conQueryPath = path.join(__dirname, "../sql/conQueries.sql");
const conQueries = fs.readFileSync(conQueryPath, "utf-8").split(";");
// Queries for share requests
const shareReqQueryPath = path.join(__dirname, "../sql/shareQueries.sql");
const shareReqQueries = fs.readFileSync(shareReqQueryPath, "utf-8").split(";");

export const findRequesteesId = async (conClient, userEmail, res) => {
  try {
    const findUser = conQueries[0];
    const userFound = await conClient.query(findUser, [userEmail]);
    if (userFound.rows.length < 1) {
      // resHandler.badRequestError(
      //   res,
      //   "No user with this email exists within our system"
      // );
      return "";
    }
    return userFound.rows[0];
  } catch (err) {
    console.log(err);
    // resHandler.executingQueryError(res, err);
    return "";
  }
};

export const checkForExistingRequest = async (
  conClient,
  userId,
  requestUserId,
  res,
  returnData
) => {
  try {
    const existingReqQuery = conQueries[1];
    const existingReq = await conClient.query(existingReqQuery, [
      userId,
      requestUserId,
    ]);
    if (existingReq.rows.length < 1) {
      if (returnData) {
        return { exists: false, data: null };
      }
      return false;
    }
    // resHandler.badRequestError(
    //   res,
    //   "You have already sent this user a connection request"
    // );
    if (returnData) {
      return { exists: true, data: existingReq.rows[0] };
    }
    return true;
  } catch (err) {
    console.log(err);
    // resHandler.executingQueryError(res, err);
    if (returnData) {
      return { exists: true, data: null };
    }
    return true;
  }
};

export const checkForExistingConnection = async (
  conClient,
  userId,
  requestUserId
) => {
  const existingConQuery = conQueries[3];
  const existingCon = await conClient.query(existingConQuery, [
    userId,
    requestUserId,
  ]);
  if (existingCon.rows.length > 0) {
    return true;
  }
  return false;
};

export const addMultiFoldersAndNotes = async (
  userId,
  folderid,
  originalFolderid,
  foldersArray,
  notesArray,
  client,
  newFoldersArray,
  newNotesArray
) => {
  if (foldersArray.length < 1) {
    return;
  }
  const foldersToAdd = foldersArray.filter(
    (fold) => fold.parentFolderId === originalFolderid
  );
  let notesToAdd;
  if (notesArray.length > 0) {
    notesToAdd = notesArray.filter(
      (note) => note.folderId === originalFolderid
    );
    if (notesToAdd.length > 0) {
      for (let i = 0; i < notesToAdd.length; i++) {
        const newNote = await client.query(notesQueries[4], [
          userId,
          notesToAdd[i].title,
          notesToAdd[i].htmlNotes,
          notesToAdd[i].locked,
          folderid,
        ]);
        newNotesArray.push(newNote.rows[0]);
      }
    }
  }
  for (let i = 0; i < foldersToAdd.length; i++) {
    const newFolder = await client.query(foldersQueries[4], [
      userId,
      foldersToAdd[i].title,
      foldersToAdd[i].color,
      folderid,
    ]);
    newFoldersArray.push(newFolder.rows[0]);
    await addMultiFoldersAndNotes(
      userId,
      newFolder.rows[0].folderid,
      foldersToAdd[i].folderid,
      foldersArray,
      notesArray,
      client,
      newFoldersArray,
      newNotesArray
    );
  }
};

export const checkForExistingShareRequest = async (
  pool,
  userId,
  requestId,
  noteId
) => {
  try {
    const query = shareReqQueries[8];

    const shareExists = await pool.query(query, [userId, requestId, noteId]);

    if (shareExists.rows.length < 1) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(
      `Error when calling helper function check for existing share request, error: ${err}`
    );
    return false;
  }
};

export const checkForExistingShare = async (pool, noteId, userId) => {
  try {
    const query = shareReqQueries[9];
    const shareExists = await pool.query(query, [noteId, userId]);
    if (shareExists.rows.length < 1) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log(`Error checking for existing shared note. Error: ${err}`);
    return false;
  }
};
