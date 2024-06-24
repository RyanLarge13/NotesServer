import { fileURLToPath } from "url";
import { dirname } from "path";
import pool from "../utils/dbConnection.js";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const v141Path = path.join(
  __dirname,
  "../emailTemplates/releaseEmails/v1.4.1.html"
);
const v141Template = await fs.readFile(v141Path, "utf-8");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "electronnotes@gmail.com",
    pass: process.env.GMAIL_APPKEY,
  },
});

const sendEmail = async () => {
  let count = 0;
  try {
    const dbClient = await pool.connect();
    try {
      const users = await dbClient.query(`
                SELECT * FROM Users
            `);
      if (users.rows.length < 1) {
        console.log("No users");
        return;
      }
      users.rows.forEach(async (user) => {
        if (user.email === process.env.MY_SECOND_EMAIL) {
          return;
        }
        const specificTemplate = v141Template.replace(
          "{username}",
          user.username
        );
        const mailOptions = {
          from: "electronnotes@gmail.com",
          to: user.email,
          subject: "New Release!",
          html: specificTemplate,
        };
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log("Email sent: " + info.response);
          count++;
        } catch (error) {
          console.error(error);
          console.log(user);
        }
      });
      console.log(count);
      dbClient.release();
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

sendEmail();
