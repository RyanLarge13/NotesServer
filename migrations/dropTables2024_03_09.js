import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/dropTables2024_03_09.sql";

migrator.migrate(modifyNotesFile);
