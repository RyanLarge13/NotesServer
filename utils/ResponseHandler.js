class ResponseHandler {
  serverError(res, message) {
    return res.status(500).json({ message: message });
  }
  badRequestError(res, message) {
    return res.status(400).json({ message: message });
  }
  authError(res, message) {
    return res.status(401).json({ message: message });
  }
  notFoundError(res, message) {
    return res.status(404).json({ message: message });
  }
  successResponse(res, message, data) {
    return res.status(200).json({ message: message, data: data });
  }
  successCreate(res, message, data) {
    return res.status(201).json({ message: message, data: data });
  }
  connectionError(res, err, controllerMethod) {
    console.error(
      `Error with pool connection when calling userController.${controllerMethod}: ${err}`
    );
    return this.serverError(
      res,
      "There was an issue connecting to the db. Please try to refresh the page and attempt to login again"
    );
  }
  executingQueryError(res, err) {
    console.error("Error executing query:", err);
    if (err instanceof SyntaxError) {
      return this.serverError(res, "Syntax error in SQL query");
    } else if (err.code === "ECONNREFUSED") {
      return this.serverError(res, "Connection to the database refused");
    } else {
      return this.serverError(res, "Internal server error");
    }
  }
}

export default ResponseHandler;
