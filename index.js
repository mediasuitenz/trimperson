var request = require('request');
var assert = require('assert');
var debug = require('debug')('trim');
var url;
var token;

function createRecord () {
  throw new Error('Not Implemented');
}

function getDocument (trimId, callback) {
  var options = {
    url: url + '/get?id=' + trimId + '&securityToken=' + token
  }
  request.get(options, function (err, res, responseBody) {
    callback(err, responseBody);
  })
}

function getContainer (trimId, callback) {
  var options = {
    url: url + '/GetContainer?trimid=' + trimId + '&securityToken=' + token,
    json: true
  };
  //  if (process.env.NODE_ENV !== 'production')
  //    debug('TRIM adapter is loading mock data');
  //    return callback(null, require(__dirname + '/mock/getContainer.json'));
  // DISABLE LIVE API FOR DEMO WOO QUALITY
  //  if (process.env.NODE_ENV !== 'production')
 debug('TRIM adapter is loading mock data');
 return callback(null, require(__dirname + '/mock/getContainer.json'));
  debug('GET %s', options.url);
  request.get(options, function (err, res, responseBody) {
    // responseBody has containerNo, subContainers, and records
    callback(err, responseBody);
  });
}

function createContainer (folderName, privacy, parentFolder, callback) {
  var body = {
    RecordNo: folderName,
    Title: folderName,
    Privacy: privacy,
    ParentFolder: parentFolder
  };
  var options = {
    url: url + '/CreateContainer?securityToken=' + token,
    json: body
  };
  request.post(options, function (err, res, responseBody) {
    callback(err, responseBody);
  });
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

if (require.main === module) {
  // invoke script directly
  url = 'http://emap.marlborough.govt.nz/trim/api/trim';
  trimId = 'BC140111';
  getContainer(trimId, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });

}
