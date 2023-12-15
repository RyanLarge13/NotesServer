import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/FolderLock2023_12_14.sql";

migrator.migrate(modifyNotesFile);