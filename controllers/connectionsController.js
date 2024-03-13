import ResponseHandler from "../utils/ResponseHandler.js";
// import Validator from "../utils/ValidateData.js";
import pool from "../utils/dbConnection.js";
import fs from "fs";
import path from "path";

const resHandler = new ResponseHandler();
// const validator = new Validator();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const conQueryPath = path.join(__dirname, "../sql/conQueries.sql");
const conQueries = fs.readFileSync(conQueryPath, "utf-8").split(";");

class ConController {
  constructor() {}

  async findRequesteesId(conClient, userEmail, res) {
    try {
      const findUser = conQueries[0];
      const userFound = conClient.query(findUser, [userEmail]);
      if (userFound.rows.length < 1) {
        resHandler.badRequestError(
          res,
          "No user with this email exists within our system"
        );
        return "";
      }
      return userFound.rows[0];
    } catch (err) {
      console.log(err);
      resHandler.executingQueryError(res, err);
      return "";
    }
  }

  async checkForExistingRequest(
    conClient,
    userId,
    requestUserId,
    res,
    returnData
  ) {
    try {
      const existingReqQuery = conQueries[1];
      const existingReq = conClient.query(existingReqQuery, [
        userId,
        requestUserId,
      ]);
      if (existingReq.rows.length < 1) {
        if (returnData) {
          return { exists: false, data: null };
        }
        return false;
      }
      resHandler.badRequestError(
        res,
        "You have already sent this user a connection request"
      );
      if (returnData) {
        return { exists: true, data: existingReq.rows[0] };
      }
      return true;
    } catch (err) {
      console.log(err);
      resHandler.executingQueryError(res, err);
      if (returnData) {
        return { exists: true, data: null };
      }
      return true;
    }
  }

  async checkForExistingConnection(conClient, userId, requestUserId, res) {
    const existingConQuery = conQueries[3];
    const existingCon = conClient.query(existingConQuery, [
      userId,
      requestUserId,
    ]);
    if (existingCon.rows.length > 0) {
      resHandler.badRequestError(
        res,
        "You already have an active connection with this user"
      );
      return true;
    }
    return false;
  }

  // Create a connection request
  async createReqCon(req, res) {
    const user = req.user;
    const { userEmail } = req.body;
    // validate email here;
    if (!userEmail) {
      return resHandler.badRequestError(
        res,
        "You must provide an email destination for your connection request"
      );
    }
    if (!user) {
      return resHandler.authError(
        res,
        "Please log back in to send this connection request"
      );
    }
    try {
      const conClient = await pool.connect();
      try {
        const requestUserId = await this.findRequesteesId(
          conClient,
          userEmail,
          res
        );
        if (!requestUserId) {
          return;
        }
        const conReqExists = await this.checkForExistingRequest(
          conClient,
          user.userId,
          requestUserId,
          res,
          false
        );
        if (conReqExists) {
          return;
        }
        const existingConnection = await this.checkForExistingConnection(
          conClient,
          user.userId,
          requestUserId,
          res
        );
        if (existingConnection) {
          return;
        }
        const createConQuery = conQueries[2];
        const newCon = await conClient.query(createConQuery, [
          user.userId,
          requestUserId,
        ]);
        if (newCon.rows.length < 1) {
          return resHandler.serverError(
            res,
            "We could not create a new connection request right now. Please try again later. If the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
          );
        }
        return resHandler.successCreate(
          res,
          "Your connection request has been sent. Once accepted you can start sharing notes immediately",
          newCon.rows[0]
        );
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "createConController");
    }
  }

  // remove an established connection
  async removeCon(req, res) {
    const user = req.user;
    const { userEmail } = req.body;
    // verify userEmail here
    if (!user) {
      return resHandler.authError(
        res,
        "You must login to remove your connection"
      );
    }
    if (!userEmail) {
      return resHandler.badRequestError(
        res,
        `You must login to remove your
   connection with ${userEmail}`
      );
    }
    try {
      const remConClient = await pool.connect();
      try {
        const conUserId = await this.findRequesteesId(
          remConClient,
          userEmail,
          res
        );
        if (!conUserId) {
          return;
        }
        const existingConnection = await this.checkForExistingConnection(
          remConClient,
          user.userId,
          conUserId,
          res
        );
        if (existingConnection) {
          return;
        }
        const remConQuery = conQueries[4];
        const remCon = remConClient.query(remConQuery, [userid, conUserId]);
        if (remCon.rows.length < 1) {
          return resHandler.serverError(
            res,
            "There was an issue removing your connection. Please try to run the request again. If you continue to have problems contact the developer at ryanlarge@ryanlarge.dev"
          );
        }
        return resHandler.successResponse(
          res,
          `Successfully deleted your connection
    with ${userEmail}`,
          null
        );
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "removeConController");
    }
  }

  // Cancel an existing connection request
  async cancelExistingConnectionReq(req, res) {
    const user = req.user;
    if (!user) {
      return resHandler.authError(
        res,
        "You must loggin first to cancel a connection request"
      );
    }
    const connectionReqId = req.body;
    if (!connectionReqId) {
      return resHandler.badRequestError(
        res,
        "You did not provide us with a valid connection request to remove."
      );
    }
    try {
      const conClient = await pool.connect();
      try {
        const findConQuery = conQueries[6];
        const requestExists = await conClient.query(findConQuery, [
          connectionReqId,
        ]);
        if (requestExists.rows.length < 1) {
          return resHandler.badRequestError(
            res,
            "No connection request exists from you to this user"
          );
        }
        const removeConReqQuery = conQueries[5];
        const removedRequest = await conClient.query(removeConReqQuery, [
          connectionReqId,
        ]);
        const rows = removedRequest.rows;
        if (
          rows[0].conreqfrom !== user.userId &&
          rows[0].conreqtwo !== user.userId
        ) {
          return resHandler.authError(
            res,
            "You are not authorized to cancel this connect"
          );
        }
        if (rows.length < 1) {
          return resHandler.serverError(
            res,
            "There was a problem removing your connection request. Please try to delete your request again. If you continue to have issues, contact the developer at ryanlarge@ryanlarge.dev"
          );
        }
        return resHandler.successResponse(
          res,
          "Your connection request has successfully been canceled",
          null
        );
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "cancelConRequest");
    }
  }

  async createConnection(req, res) {
    const user = req.user;
    if (!user) {
      return resHandler.authError(
        res,
        "You must be logged in to make this request"
      );
    }
    const { requestId, userEmail } = req.body;
    if (!requestId) {
      return resHandler.badRequestError(
        res,
        `You do not have a connection request sent by ${userEmail}`
      );
    }
    if (!userEmail) {
      return resHandler.badRequestError(
        res,
        `You do not have a connection request sent by ${userEmail}`
      );
    }
    try {
      const conClient = await pool.connect();
      try {
        const requestUserId = await this.findRequesteesId(
          conClient,
          userEmail,
          res
        );
        if (!requestUserId) {
          return;
        }
        const connectionExists = this.checkForExistingConnection(
          conClient,
          user.userId,
          requestUserId,
          res
        );
        if (connectionExists) {
          return resHandler.badRequestError(
            res,
            `You already have an established connection with ${userEmail}`
          );
        }
        const existingReq = this.checkForExistingRequest(
          conClient,
          user.userId,
          requestUserId,
          res,
          true
        );
        if (!existingReq.data || !existingReq.exists) {
          return resHandler.authError(
            res,
            "You are not authorized to make this request"
          );
        }
        const isReceiver = () => {
          const data = existingReq.data;
          if (data.conReqFrom === user.userId) {
            return false;
          }
          if (data.conReqTo !== user.userId) {
            return false;
          }
          return true;
        };
        if (!isReceiver()) {
          return resHandler.badRequestError(
            res,
            "You cannot accept requests for another user."
          );
        }
        const createConQuery = conQueries[7];
        const createdConnection = await conClient.query(createConQuery, [
          user.userId,
          requestUserId,
        ]);
        if (createdConnection.rows.length < 1) {
          return resHandler.serverError(
            res,
            "There was a problem creating your new connection. Please try to accept this request again. If the issue persists, please contact the developer at ryanlarge@ryanlarge,dev"
          );
        }
        return resHandler.successCreate(
          res,
          `You now share a new connection with ${userEmail}`,
          { connection: createdConnection.rows[0] }
        );
      } catch (err) {
        console.log(err);
        return resHandler.executingQueryError(res, err);
      }
    } catch (err) {
      console.log(err);
      return resHandler.connectionError(res, err, "cancelConRequest");
    }
  }
}

export default ConController;
