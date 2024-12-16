import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/favoriteNotes2024_12_13.sql";

migrator.migrate(modifyNotesFile);
