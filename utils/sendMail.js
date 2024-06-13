import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Welcome email template
const welcomeEmailTemplatePath = path.join(
  __dirname,
  "../emailTemplates/welcome.html"
);
const welcomeEmailTemplate = await fs.readFile(
  welcomeEmailTemplatePath,
  "utf-8"
);

// reset username and password template
const resetPassAndUsernameEmailPath = path.join(
  __dirname,
  "../emailTemplates/passUsernameReq.html"
);
const resetPassAndUsernameEmailTemplate = await fs.readFile(
  resetPassAndUsernameEmailPath,
  "utf-8"
);

// Changed password template
const changedPasswordPath = path.join(
  __dirname,
  "../emailTemplates/changePassword.html"
);
const changedPasswordTemplate = await fs.readFile(changedPasswordPath, "utf-8");

// New connection request template
const newConReqPath = path.join(__dirname, "../emailTemplates/newConReq.html");
const newConReqTemplate = await fs.readFile(newConReqPath, "utf-8");

// New connection
const newConPath = path.join(__dirname, "../emailTemplates/newCon.html");
const newConTemplate = await fs.readFile(newConPath, "utf-8");

// New user created admin
const newUserCreatedPath = path.join(
  __dirname,
  "../emailTemplates/adminNewUser.html"
);
const newUserCreatedTemplate = await fs.readFile(newUserCreatedPath, "utf-8");

// User deleted account admin
const userDeletedAccountPath = path.join(
  __dirname,
  "../emailTemplates/adminUserDelete.html"
);
const userDeletedAccountTemplate = await fs.readFile(
  userDeletedAccountPath,
  "utf-8"
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "electronnotes@gmail.com",
    pass: process.env.GMAIL_APPKEY,
  },
});

// load csv file function local
const loadCSVFile = async (filePath, ip) => {
  return new Promise((res, rej) => {
    const readStream = fs.createReadStream(filePath, { encoding: "utf8" });
    readStream.on("data", (chunk) => {
      let objs = [];
      const split = chunk.split(",");
      const len = split.length;
      for (let i = 0; i < len - 4; i += 4) {
        const newObj = {
          startIp: parseInt(split[i], 10),
          endIp: parseInt(split[i + 1], 10),
          countryString: split[i + 3],
        };
        objs.push(newObj);
      }
      objs.sort((a, b) => a.startIp - b.startIp);
      if (objs[len - 1].startIp === ip) {
        res({ objs: null, obj: objs[len - 1] });
      }
      if (objs[len - 1].startIp < ip) {
        res({ objs: objs, obj: null });
      }
    });
    readStream.on("end", () => {
      console.log("CSV parse complete");
      res({ objs: null, obj: null });
    });
    readStream.on("error", () => rej());
    readStream.on("close", () => {
      console.log("CSV closed");
      res({ objs: null, obj: null });
    });
  });
};

// local binary search for finding country
const findCountry = (objs, ip) => {
  const mid = Math.round(objs.length / 2) + 1;
  if (objs[mid].startIp === ip) {
    return objs[mid].countryString;
  }
  if (mid === 1) {
    return null;
  }
  if (objs[mid].startIp < ip) {
    const newObjs = objs.splice(0, mid - 1);
    findCountry(newObjs, ip);
  }
  if (objs[mid].startIp > ip) {
    const newObjs = objs.splice(mid, objs.length);
    findCountry(newObjs, ip);
  }
};

// Compose welcome email
export const sendWelcomeEmail = async (recipientEmail, username, password) => {
  const customizedWelcomeEmailContent = welcomeEmailTemplate
    .replace("{username}", username)
    .replace("{password}", password);
  const mailOptions = {
    from: "electronnotes@gmail.com",
    to: recipientEmail,
    subject: "Welcome to Notes",
    html: customizedWelcomeEmailContent,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error(error);
  }
};

export const sendAdminEmailUserCreate = async (
  newUserEmail,
  newUserUsername,
  ip,
  create
) => {
  const IPRanges = await loadCSVFile("../assets/IP2LOCATION-LITE_DB1.cvs", ip);
  let country = null;
  if (IPRanges.obj !== null) {
    country = IPRanges.obj.countryString;
  }
  if (IPRanges.obj === null && IPRanges.objs !== null) {
    country = findCountry(IPRanges.objs, ip);
  }
  const customizedEmailTemplate = create
    ? newUserCreatedTemplate
    : userDeletedAccountTemplate;
  customizedEmailTemplate
    .replace("{username}", newUserUsername)
    .replace("{email}", newUserEmail)
    .replace("{dateTime}", new Date().toLocaleDateString("en-US"))
    .replace("{location}", country ? country : "No location provided");
  const mailOptions = {
    from: "electronnotes@gmail.com",
    to: process.env.MY_EMAIL,
    subject: "Password Reset",
    html: customizedEmailTemplate,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error(error);
  }
};

export const sendPasswordReqEmail = async (
  recipientEmail,
  username,
  password
) => {
  const customizedWelcomeEmailContent = resetPassAndUsernameEmailTemplate
    .replace("{username}", username)
    .replace("{password}", password);
  const mailOptions = {
    from: "electronnotes@gmail.com",
    to: recipientEmail,
    subject: "Password Reset",
    html: customizedWelcomeEmailContent,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error(error);
  }
};

export const sendChangePasswordEmail = async (
  recipientEmail,
  username,
  password
) => {
  const customizedWelcomeEmailContent = changedPasswordTemplate
    .replace("{username}", username)
    .replace("{password}", password);
  const mailOptions = {
    from: "electronnotes@gmail.com",
    to: recipientEmail,
    subject: "Password Change",
    html: customizedWelcomeEmailContent,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error(error);
  }
};

export const sendConnectionReqEmail = async (
  recipientEmail,
  recipientsName,
  sendersName,
  sendersEmail
) => {
  const customizedNewConReqContent = newConReqTemplate
    .replace("{sendersName}", sendersName)
    .replace("{sendersEmail}", sendersEmail)
    .replace("{username}", recipientsName);
  const mailOptions = {
    from: "electronnotes@gmail.com",
    to: recipientEmail,
    subject: "New Connection Request",
    html: customizedNewConReqContent,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent", info.response);
  } catch (err) {
    console.log(err);
  }
};

export const sendNewConnectionEmail = async (
  recipientEmail,
  recipientsName,
  sendersName,
  sendersEmail
) => {
  const customizedConContent = newConTemplate
    .replace("{acceptersEmail}", sendersEmail)
    .replace("{acceptersName}", sendersName)
    .replace("{username}", recipientsName);
  const mailOptions = {
    from: "electronnotes@gmail.com",
    to: recipientEmail,
    subject: "New Connection",
    html: customizedConContent,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent", info.response);
  } catch (err) {
    console.log(err);
  }
};

export const sendNewSharedNoteEmail = async () => {};
