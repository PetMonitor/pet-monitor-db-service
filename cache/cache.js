const logger = require('../utils/logger.js');

const NodeCache = require('node-cache');

const DEFAULT_TTL_SECONDS = 300;

const myCache = new NodeCache({ 
    stdTTL: DEFAULT_TTL_SECONDS, //standard ttl, in seconds, for every generated cache element
    deleteOnExpire: true,
    useClones: false
});


function get(key) {
    value = myCache.get(key);
    if ( value == undefined ){
        logger.info(`Retrieve key ${key} from memory cache returned undefined.`);
    }
    return value;
}

function hasKey(key) {
    return myCache.has(key);
}

function set(key, value, ttl=DEFAULT_TTL_SECONDS) {
    const res = myCache.set(key, value, ttl);
    if (!res) {
        logger.error(`Failed to save key to memory cache ${key}.`);
    }
    return res;
}


module.exports = {
	set: set,
	get: get,
	hasKey: hasKey,
}