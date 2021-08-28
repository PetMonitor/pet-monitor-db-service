const express = require('express')
const app = express();
const port = process.env.PORT || '8000';

var pets = require('/usr/src/app/routes/pets.js');
var petPhotos = require('/usr/src/app/routes/petPhotos.js');
var notices = require('/usr/src/app/routes/notices.js');
var users = require('/usr/src/app/routes/users.js');
var userNotices = require('/usr/src/app/routes/userNotices.js');

app.use(express.urlencoded({extended: true}));
app.use(express.json())

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

/**
* Server Activation
*/

app.listen(port, () => {
	console.log(`Listening to requests on http://localhost:${port}`)
});

module.exports = app