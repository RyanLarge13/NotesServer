# NotesServer

Notes server is the full backend application written in Nodejs for the frontend desktop application [Notes](https://github.com/RyanLarge13/Notes) and the frontend mobile notes taking app [Notes Mobile](https://github.com/RyanLarge13/Notes-Native).

## Libraries

This application takes advantage of

1. [express: ^4.18.2](https://www.npmjs.com/package/express) for http protocol handling and routing
2. [pg: ^8.11.3](https://www.npmjs.com/package/pg) for connecting to elephantsql postgres db
3. [jsdom: ^23.0.1](https://www.npmjs.com/package/jsdom) for sanitizing html as it passes between server and client
4. [jsonwebtoken: ^9.0.2](https://www.npmjs.com/package/jsonwebtoken) for authentication and password less logins
5. [cors: ^2.8.5](https://www.npmjs.com/package/cors) for validating client origins
6. [body-parser: ^1.20.2](https://www.npmjs.com/package/body-parser) for request body parsing
7. [bcryptjs: ^2.4.3](https://www.npmjs.com/package/bcryptjs) for password hashing
8. And [nodemon: ^3.0.1](https://www.npmjs.com/package/nodemon) for development

## Code Structure

### Multi Paradigm

The server is designed with a mixture of both functional and object oriented style code.

Repetitive tasks with related functionality live within their own classes and build an easy to use and easy to understand abstraction to allow you to worry more about the logical steps of a process then validating or exception handling for example.

### Modularized

The server, routes, and controllers and all seperated into their own directories for orginization. Raw SQL was used and also modularize into its own folders. SQL queries and SQL migrations

### Functional

This application strays away from updating global state. Pure functions and pure methods are used to encapsulate and return new data

## Run The Code

1. Clone the repo

```
git clone git@github.com:Ryanlarge13/Notes-Server.git
```

2. Install deps

```
cd Notes-Server && npm install
```

3. You will need to build a dbConnection.js file under utils. Copy and past this code and change the placeholders

```
import pkg from 'pg';
const { Pool} = pkg;

const pool = new Pool({
  user: "db_username",
  host: "db_host",
  database: "",
  password: "db_password",
  port: 5432,
});

export default pool;
```

4. Run the server and test it with postman, customize it, change it, have fun.

```
npm run dev
```

## Contributing

If you are interested in contributing your version of this server feel free to open a pull request. Checkout the PR template here [PR Template](./PULL_REQUEST_TEMPLATE)
