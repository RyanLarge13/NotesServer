import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/dropTrashTable2024_2_11.sql";

migrator.migrate(modifyNotesFile);
