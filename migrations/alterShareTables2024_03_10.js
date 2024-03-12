import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/alterShareTables2024_03_10.sql";

migrator.migrate(modifyNotesFile);
