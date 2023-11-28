import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/modifyNotes.sql";

migrator.migrate(modifyNotesFile);
