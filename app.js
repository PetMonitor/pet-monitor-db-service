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
var photos = require('./routes/photos.js');
var userNotices = require('./routes/userNotices.js');
var credentialValidation = require('./routes/credentialValidator.js');
var socialMediaPosts = require('./routes/socialMediaPosts.js');

var finder = require('./routes/finder.js');

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
app.use('/photos', photos);
app.use('/users/:userId/pets/:petId/photos', petPhotos)
app.use('/users/credentialValidation', credentialValidation);

app.use('/pets/finder', finder);

app.use('/facebook/posts', socialMediaPosts);

/**
* Server Activation
*/

app.listen(port, () => {
	console.log(`Listening to requests on http://localhost:${port}`)
});

module.exports = app