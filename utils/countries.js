import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cvsFilePath = path.join(__dirname, "../assets/IP2LOCATION-LITE-DB1.CSV");
let objs = [];

const loadCVSFile = async () => {
  try {
    const readStream = await fs.readFile(cvsFilePath, { encoding: "utf-8" });
    const split = readStream.split("\n");
    const len = split.length;
    objs = [];
    for (let i = 0; i < len; i++) {
      const values = split[i].split(",");
      const start = parseInt(values[0].replace('"', "").trim(), 10);
      const end = parseInt(values[1].replace('"', "").trim(), 10);
      objs.push({
        start: start,
        end: end,
        country: values[3].replace('"', "").trim(),
      });
    }
  } catch (err) {
    console.log(`Could not load in countries DB, Please try again. \n ${err}`);
  }
};

export const searchCountry = (ip) => {
  let low = 0;
  let high = objs.length;
  if (high === 0) {
   return "no country found";
  }
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (objs[mid].start <= ip && objs[mid].end >= ip) {
      return objs[mid].country;
    }
    if (objs[mid].start < ip) {
      low = mid + 1;
    }
    if (objs[mid].start > ip) {
      high = mid - 1;
    }
  }
  return null;
};

export default loadCVSFile;
