var assert = require('assert');
var url, token;

function createRecord (title, container, extension, fileData) {
  return new Promise(function (resolve) {
    return resolve({RecordNo: "13228764"})
  })
}

function getDocument (trimId) {
  return new Promise(function (resolve) {
    return resolve('');
  })
}

function getContainer (trimId) {
  return new Promise(function (resolve) {
    return resolve(require('./mock/getContainer.json'));
  })
}

function createContainer (folderName, privacy, parentFolder) {
  return new Promise(function (resolve) {
    return resolve({})  // dunno what this is supposed to be.
  })
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
