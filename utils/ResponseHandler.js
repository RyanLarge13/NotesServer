class ResponseHandler {
  serverError = (res, message) => {
    return res.status(500).json({ message: message });
  };
  badRequesstError = (res, message) => {
    return res.status(400).json({ message: message });
  };
  authError = (res, message) => {
    return res.status(401).json({ message: message });
  };
  notFoundError = (res, message) => {
    return res.status(404).json({ message: message });
  };
  successResponse = (res, message, data) => {
    return res.status(200).json({ message: message, data: data });
  };
  successCreate = (res, message, data) => {
    return res.status(201).json({ message: message, data: data });
  };
}

export default ResponseHandler;
