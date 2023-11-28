import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/nestedFolders2024_28_11.sql";

migrator.migrate(modifyNotesFile);
