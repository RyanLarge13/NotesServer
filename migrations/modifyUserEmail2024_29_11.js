import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/uniqueEmail2024_29_11.sql";

migrator.migrate(modifyNotesFile);