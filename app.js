const express = require("express")
const path = require("path")
const app = express();
const port = process.env.PORT || "8000";

const db = require('/usr/src/app/models/index.js');

/**

* Server Endpoints

*/

app.get("/", (req, res) => {
	
	res.status(200).send("Now is the winter of our discontent");

});

app.get("/users", async (req, res) => {

	try {
		db.Users.findAll({ attributes: ['username','email','password']})
			.then((users) => { res.status(200).send(JSON.stringify(users)); });
  	} catch (err) {
  		console.error(err);
  		res.status(500).send({"ERROR":err});
  	} 
});

/**

* Server Activation

*/

app.listen(port, () => {
	
	console.log(`Listening to requests on http://localhost:${port}`)

});

