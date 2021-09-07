const express = require('express')
const port = process.env.PORT || '8000';

var app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}));

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

app.use('/users', users);
app.use('/users/:userId/pets', pets);
app.use('/users/:userId/notices', userNotices);
app.use('/notices', notices);
app.use('/users/:userId/pets/:petId/photos', petPhotos)
app.use('/users/credentialValidation', credentialValidation);

/**
* Server Activation
*/

app.listen(port, () => {
	console.log(`Listening to requests on http://localhost:${port}`)
});

module.exports = app