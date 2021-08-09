const express = require('express')
const bodyParser = require("body-parser");

const port = process.env.PORT || '8000';

var app = express();
app.use(bodyParser.json({ limit:"200mb", type:'application/json' }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 50000 }));

var pets = require('./routes/pets.js');
var petPhotos = require('./routes/petPhotos.js');
var notices = require('./routes/notices.js');
var users = require('./routes/users.js');
var userNotices = require('./routes/userNotices.js');
var credentialValidation = require('./routes/credentialValidator.js');

/**
* Server Endpoints
*/

app.get('/', (req, res) => {
	res.status(200).send('Now is the winter of our discontent');
});

<<<<<<< HEAD
app.use('/users', users);
app.use('/users/:userId/pets', pets);
app.use('/users/:userId/notices', userNotices);
app.use('/notices', notices);
app.use('/users/:userId/pets/:petId/photos', petPhotos)
app.use('/users/credentialValidation', credentialValidation);
=======
app.get("/users", async (req, res) => {

	try {
		db.Users.findAll({ attributes: ['username','email','password']})
			.then((users) => { res.status(200).send(JSON.stringify(users)); });
  	} catch (err) {
  		console.error(err);
  		res.status(500).send({"ERROR":err});
  	} 
});
>>>>>>> 06a2ddf (Add seeders.)

/**
* Server Activation
*/

app.listen(port, () => {
	console.log(`Listening to requests on http://localhost:${port}`)
});

module.exports = app