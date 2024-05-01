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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "electronnotes@gmail.com",
    pass: process.env.GMAIL_APPKEY,
  },
});

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
