var express = require('express');
var router = express.Router();

var http = require('http-status-codes');
var router = express.Router({mergeParams: true});

/**
* PetPhotos CRUD endpoints.
*/

// Add new photo
router.post('/', async (req, res) => {
    res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
        error: "Endpoint not implemented"
    });
})

// Remove existing photo
router.delete('/:photoId', async (req, res) => {
    res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).send({ 
        error: "Endpoint not implemented"
    });
})

module.exports = router;