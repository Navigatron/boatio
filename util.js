'use strict';

var _idCounter = 0;

function getNewID(){
    _idCounter++;
    return _idCounter;
    console.log('Issued ID \''+_idCounter+'\'.');
}

module.exports = getNewID;
