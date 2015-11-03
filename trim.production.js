var request = require('request');
var assert = require('assert');
var debug = require('debug')('trim');
var url;
var token;


/**
 * Define the callback from the `createRecord` method
 * @callback createRecordCallback
 * @param {Error}  error
 * @param {String} recordNo The TRIM RecordNo of the new document, if created.
 */


/**
 * @param {String} title Record Title
 * @param {String} container Name of the container to upload to
 * @param {String} extension without the period, e.g. "pdf" or "png" but not ".png"
 * @param {String} fileData base64 encoding of the date without the dateURL prefix stuff
 * @param {String[]} alternativeContainers Names of containers to link the file to in addition to the "container" param
 * @param {createRecordCallback} callback
 */
function createRecord (title, container, extension, fileData, alternativeContainers, callback) {
  if (typeof alternativeContainers === 'function') {
    throw new Error('Migration Error: a new parameter was added: alternativeContainers')
  }
  alternativeContainers = alternativeContainers || [];
  if (!R.isArrayLike(alternativeContainers)) {
    throw new Error('alternativeContainers must be a list of strings')
  }

  var options = {
    url: url + '/AddRecordToTrim?securityToken=' + token,
    method: 'post',
    body: {
      Title: title,
      Container: container,
      RecordExtension: extension,
      AlternativeContainers: alternativeContainers,
      Record: fileData
    },
    json: true
  }
  request(options, function (err, res, responseBody) {
    if (err) return callback(err);

    var trimRecordNo = responseBody.RecordNo;

    if (!trimRecordNo) {
      debug('Invalid response %j', responseBody);
      return callback(new Error('Error uploading document to TRIM: Missing RecordNo response. ' + responseBody.message));
    }
    debug('Created record with recordNo %s', trimRecordNo);
    return callback(null, trimRecordNo)
  });
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

/**
 *
 * @param {String} apiUrl Base TRIM url
 * @param {String} apiToken TRIM securityToken
 * @param {Boolean} debug If true, then require `request-debug`
 * @return {{getContainer: getContainer, getDocument: getDocument, createContainer: createContainer, createRecord:
 *     createRecord}}
 */
module.exports = function (apiUrl, apiToken, debug) {
  assert(typeof apiUrl === 'string', 'Argument 1 to instantiate the TRIM wrapper must be a valid url.')
  assert(typeof apiToken === 'string', 'Argument 2 to instantiate the TRIM wrapper must be a valid apiToken.')

  url = apiUrl;
  token = apiToken;
  if (!!debug)
    require('request-debug')(request);

  return {
    getContainer: getContainer,
    getDocument: getDocument,
    createContainer: createContainer,
    createRecord: createRecord
  }
}
