# Notes Server API Documentation

All routes are simplified and built for desktop and mobile interfaces where the urls are not visibly accessible within the main application

**All fetch requests examples will be using Axios**

There are three base routes set up to control the data within the application

1. users/
2. notes/
3. folders/

All requests sent to the backend require data within the body of a request and an authorization header besides login & signup routes and delete or get request

---

## User routes

All user routes begin with **users/**
example

**my-app/users/\***

### PATCH & POST

This section will cover all of the patch and post requests available for the users table

#### Create a new user - POST

##### my-app/users/signup

**example request**

```
const signup = (userData) => {
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

**example response**

```
{
  	message: "Successfully created your new account",
  	data: "JsjshdkJwgd35827_8qi190sSHJ...."
}
```

---

#### Login a user - POST

##### my-app/users/login

**example request**

```
const login = (userData) => {
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

**example response**

```
{
  	message: "You were successfully authenticated and are now logged in",
	data: "JsjshdkJwgd35827_8qi190sSHJ...."
}
```

---

#### Update a user's username or email - PATCH

##### my-app/users/update

**example request**

```
const updateUser = (token, userData) => {
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

This route will update the given username and email. Both username and email must be passed in through with the request but one of them is allowed to be a **null** or **undefined** value, but not both

**example response**

```
 {
  message: "Your account was successfully updated",
 	data: {
		token: "ke8w2uehJeuwkKjHHHNRK002...",
		user: {
			userId,
			username,
			email,
			createdAt
		}
 	}
 }
```

---

### GET & DELETE

These requests will cover all of the get and delete requests on a user table

#### Fetch all user data - GET

##### my-app/users/data

**example request**

```
const getUserData = (token) => {
	const res = Axios.post(`${productionUrl}/users/data`, {
	  headers: {
		  Authorization: `Bearer ${token}`
  	    }
	});
	return res;
}
```

This endpoint will return all of the users information in a single formatted object easy for client consumption including the users notes and folders

**example response**

```
{
	message: "Successfully fetched user information",
	data:
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
}
```

As you can see there can be a large amount of nesting involved in this pre-formatted object but this keeps complexity low for rendering UI and a higher workload on the server and a lower workload for the client

---

#### Delete a user - DELETE

##### my-app/users/delete/

Deleting a user has a cascade effect. All notes and folders associated with the user will also be deleted

**example request**

```
const deleteUser = (token) => {
	const res = Axios.post(`${productionUrl}/users/delete`, {
	  headers: {
		  Authorization: `Bearer ${token}`
  		}
	});
	return res;
}
```

This query will delete your account completely and all of the data associated with it.

**example response**

```
{
	message: "Your account was successfully deleted",
	data: null
}
```

---

## Note routes

All notes routes begin with **notes/**
example

**my-app/notes/\***

### PATCH & POST

This section will cover all of the patch and post requests available for the notes table

#### Create a new notes - POST

##### my-app/notes/create

**example request**

```
const createNote = (token, note) => {
	const res = Axios.post(`${productionUrl}/notes/create`, { ...note }, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res;
}
```

The notes parameter should be passed in as an object to the request function

**example response**

```
{
	message: "Successfully created your new note",
	data: [{
	  noteId: "unique id",
		title: "Note title",
		folderId: "id to parent folder",
		htmlText: "<p>Your html</p>"
	}]
}
```

#### Update a note - PATCH

##### my-app/notes/update

**example request**

```
const updateNote = (token, note) => {
	const res = Axios.post(`${productionUrl}/notes/create`, { ...note }, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res;
}
```

This request, like the create request will return your newly created / updated note from the database

**example response**

```
{
	message: "Successfully updated your new note",
	data: [{
	  noteId: "unique id",
		title: "Note title",
		folderId: "id to parent folder",
		htmlText: "<p>Your html</p>"
	}]
}
```

### GET && DELETE

This section will cover all of the GET and DELETE requests available for the notes table

#### Get a user's notes - GET

##### my-app/notes/

**example request**

```
const getUserNotes = (token) => {
	const res = Axios.post(`${productionUrl}/notes/create`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res;
}
```

This request will return all of the notes related to a user

**example response**

```
{
	message: "Successfully found your notes",
	data: [{ ...note }, { ...note }]
}
```

Look at the previous create or update request to get an idea of what a note looks like

#### Delete a user's note - DELETE

##### my-app/notes/delete/:noteId

**example request**

```
const getUserNotes = (token, noteId) => {
	const res = Axios.post(`${productionUrl}/notes/delete/${noteId}, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res;
}
```

This request a note with the matching noteId in the database and return to the client the deleted note

**example response**

```
{
	messenge: "Successfully deleted your note", 
	data: { ...note }
}
```