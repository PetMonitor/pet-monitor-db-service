var crypto = require('crypto');

HASH_FUNCTION = 'sha256'
ENCODING = 'hex'

function hashPassword(password) {
    const hash = crypto.createHash(HASH_FUNCTION)
    hash.update(password)
    return hash.digest(ENCODING)
}

module.exports = hashPassword