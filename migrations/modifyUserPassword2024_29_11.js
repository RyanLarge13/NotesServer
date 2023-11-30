import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/passwordLength2024_29_11.sql";

migrator.migrate(modifyNotesFile);