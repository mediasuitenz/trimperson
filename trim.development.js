var assert = require('assert');
var url, token;

function createRecord (title, container, extension, fileData, callback) {
  callback(err, {RecordNo: "151509"})
}

function getDocument (trimId, callback) {
  callback(null, null);
}

function getContainer (trimId, callback) {
  return callback(null, require('./mock/getContainer.json'));
}

function createContainer (folderName, privacy, parentFolder, callback) {
  callback(null, {}); // dunno what this is supposed to be.
}

module.exports = function (apiUrl, apiToken) {
  assert(typeof apiUrl === 'string', 'Argument 1 to instantiate the TRIM wrapper must be a valid url.')
  assert(typeof apiToken === 'string', 'Argument 2 to instantiate the TRIM wrapper must be a valid apiToken.')

  url = apiUrl;
  token = apiToken;

  return {
    getContainer: getContainer,
    getDocument: getDocument,
    createContainer: createContainer,
    createRecord: createRecord
  }
}
