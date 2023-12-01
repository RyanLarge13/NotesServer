# Notes Server API Documentation

All routes are simplified and built for desktop and mobile interfaces where the urls are not visibly accessible within the main application

** All fetch requests examples will be using Axios **

There are three base routes set up to control the data within the application

1. users/
2. notes/
3. folders/

All requests sent to the backend require data within the body of a request and an authorization header besides login & signup routes and delete or get requests

## User routes

All user routes begin with ** "users/" **
example

** "https://my-app/users/" **

### PATCH & POST

These routes will require data to be sent in the body of the request along with an Authorization header like so if it is an update request

```
headers: {
	Authorization: `Bearer ${token}`
}
```

#### Create a new user - POST

##### https://my-app/users/signup

** example request **

```
const createUser = (userData) => {
  const { username, email, password } = userData;
	const res = Axios.post(`${productionUrl}/users/signup`, {
		username,
		email,
		password
	});
	return res;
}
```

this example will create a new user with the provided information and return a JWT token to the client

** example response **

```
JsjshdkJwgd35827_8qi190sSHJ....
```

#### Login a user - POST

##### https://my-app/users/login

** example request **

```
const createUser = (userData) => {
  const { username, email, password } = userData;
	const res = Axios.post(`${productionUrl}/users/login`, {
	  username,
	  email,
	  password
	});
	return res;
}
```

This route will login a user given they provided data for each userData field and return to the client a JWT token

** example response **

```
JsjshdkJwgd35827_8qi190sSHJ....
```

#### Update a user's username or email - PATCH

##### https://my-app/users/update

** example request **

```
const createUser = (token, userData) => {
  const { username, email } = userData;
	const res = Axios.post(`${productionUrl}/users/update`, {
	  username,
	  email
	}, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res;
}
```

This route will update the given username and email. Both username and email must be passed in through with the request but one of them can be a ** null ** or ** undefined ** value, but not both

** example response **

```

```

### GET & DELETE

#### Fetch all user data - GET

##### https://my-app/users/data

** example request **

```
const createUser = (token) => {
	const res = Axios.post(`${productionUrl}/users/data`, {
	  headers: {
		  Authorization: `Bearer ${token}`
  	}
	});
	return res;
}
```

This endpoint will return all of the users information in a single formatted object easy for client consumption including the users notes and folders

** example response **

```
{
	username,
	email,
	createdAt,
	folders: [
	  {
	    folderId: 1,
	  	title: "My first folder",
	  	color: "red",
	  	folders: [
	  	  {
	  	    folderId: 3,
	  	  	title: "I am a sub folder!"
	  	  	color: "black",
	  	  	parentFolderId: 1,
	  	  	folders: [],
	  	  	notes: []
	  	  }
	  	],
	  	notes: []
	  },
	  {
	    folderId: 2,
	  	title: "My second folder",
	  	color: "blue",
	  	folder: [],
	  	notes: [
	  	  {
	  	    noteId: 1,
	  	    parentFolderId: 2,
	  	  	title: "My folder 2 note!",
	  	  	htmlText: "<p>Hi!</p>"
	  	  }
	  	]
	  }
	]
}
```

As you can see there can be a large amount of nesting involved in this pre-formatted object but this keeps complexity low for rendering UI and a higher workload on the server and a lower workload for the client
