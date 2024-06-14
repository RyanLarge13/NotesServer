import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const modifyNotesFile = "../sql/migrationQueries/onCascadeCons2024_06_14.sql";

migrator.migrate(modifyNotesFile);
