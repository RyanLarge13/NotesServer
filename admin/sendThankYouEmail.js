import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const thankYouTemplatePath = path.join(
  __dirname,
  "../emailTemplates/thankyou.html"
);
const thankYouEmailTemplate = await fs.readFile(thankYouTemplatePath, "utf-8");
