import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const thankYouTemplatePath = path.join(
 __dirname,
 "../emailTemplates/thankyou.html"
);
const thankYouEmailTemplate = await fs.readFile(thankYouTemplatePath, "utf-8");

const transporter = nodemailer.createTransport({
 service: "gmail",
 auth: {
  user: "electronnotes@gmail.com",
  pass: ""
 }
});

const sendEmail = async () => {
 const mailOptions = {
  from: "electronnotes@gmail.com",
  to: "",
  subject: "Thank You",
  html: thankYouEmailTemplate
 };
 try {
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent: " + info.response);
 } catch (error) {
  console.error(error);
 }
};

sendEmail();
