import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/noteTrashed2024_02_11.sql";

migrator.migrate(modifyNotesFile);
