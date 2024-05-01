import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/emailNotifs2024_05_01.sql";

migrator.migrate(modifyNotesFile);
