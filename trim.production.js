var request = require('request');
var assert = require('assert');
var debug = require('debug')('trim');
var url;
var token;

var createRecord;
if (process.env.NODE_ENV !== 'production') {
  createRecord = function createRecord (title, container, extension, fileData, callback) {
    callback(err, {RecordNo: "151509"})
  }
} else {
  createRecord = function createRecord (title, container, extension, fileData, callback) {
    var options = {
      url: url + '/AddRecordToTrim?securityToken=' + token,
      json: {
        Title: title,
        Container: container,
        RecordExtension: extension,
        fileData: fileData
      }
    }

    request.post(options, function (err, res, responseBody) {
      callback(err, responseBody)
    });
  }

}

/**
 * Get the actual document, not the TRIM record
 * @param trimId
 * @param callback
 */
function getDocument (trimId, callback) {
  var options = {
    url: url + '/get?id=' + trimId + '&securityToken=' + token
  }
  request.get(options, function (err, res, responseBody) {
    callback(err, responseBody);
  })
}

/**
 * This callback returns a container
 * @callback containerCallback
 * @param {Error}     error
 * @param {Object}    container
 * @param {String}    container.containerNo
 * @param {Object[]}  container.subcontainers
 * @param {Object[]}  container.records
 */


/**
 * @param trimId
 * @param {containerCallback}  callback
 */
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



/**
 *
 * @param folderName
 * @param privacy
 * @param parentFolder
 * @param callback
 */
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
