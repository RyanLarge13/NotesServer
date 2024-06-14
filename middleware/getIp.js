const grabIp = (req, res, next) => {
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (ip.includes(",")) {
    ip = ip.split(",")[0];
  }
  const ipInt = parseInt(ip.replace(/\D/g, ""), 10);
  req.clientIp = ipInt;
  next();
};

export default grabIp;
