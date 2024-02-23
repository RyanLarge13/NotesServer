import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile =
  "../sql/migrationQueries/updateDateNotes_2024_02_23.sql";

migrator.migrate(modifyNotesFile);
