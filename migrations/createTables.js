import Migrator from "../utils/Migrator.js";
const migrator = new Migrator();

const createTablesSQLFile = "../sql/migrationQueries/createTables.sql";

migrator.migrate(createTablesSQLFile);
