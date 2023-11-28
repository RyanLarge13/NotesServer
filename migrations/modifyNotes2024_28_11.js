import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/updateNotesId2024_28_11.sql";

migrator.migrate(modifyNotesFile);
