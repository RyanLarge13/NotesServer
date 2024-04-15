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

const thankYouTemplatePath = path.join(
  __dirname,
  "../emailTemplates/thankyou.html"
);
const thankYouEmailTemplate = await fs.readFile(thankYouTemplatePath, "utf-8");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "electronnotes@gmail.com",
    pass: "kfdd zhdz asds ouiw",
  },
});

const sendEmail = async () => {
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
        if (
          user.email === "ryanhudsonlarge13@gmail.com" ||
          user.email === "ryanlarge13@gmail.com"
        ) {
          return;
        }
        const specificTemplate = thankYouEmailTemplate.replace(
          "{username}",
          user.username
        );
        const mailOptions = {
          from: "electronnotes@gmail.com",
          to: user.email,
          subject: "Thank You",
          html: specificTemplate,
        };
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log("Email sent: " + info.response);
        } catch (error) {
          console.error(error);
        }
      });
      dbClient.release();
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

sendEmail();
