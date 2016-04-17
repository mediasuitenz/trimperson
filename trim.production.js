var request = require('request');
var assert = require('assert');
var debug = require('debug')('trim');
var R = require('ramda-extended');
var url;
var token;

var PRIVACY_LEVELS = {
  PUBLIC: 1,
  PRIVATE: 2
}

/**
 * Define the callback from the `createRecord` method
 * @callback createRecordCallback
 * @param {Error}  error
 * @param {String} recordNo The TRIM RecordNo of the new document, if created.
 */

/**
 * Uploads a Document to TRIM
 * @param {Object}    data
 * @param {String}    data.title
 * @param {String}    data.container Primary container to upload to
 * @param {String}    data.extension Omit the period, e.g. "pdf" or "png" but not ".png"
 * @param {String}    data.fileData Base64 String without the prefix
 * @param {String[]}  data.alternativeContainers A list of additional TRIM containers to upload to
 * @param {Boolean}   data.privacyLevel public=1, private=2; higher numbers escalate privacy level
 * @param {createRecordCallback}  callback
 */
function createRecord(data, callback) {
  if (arguments.length === 5) {
    // Compatibility with usage before the alternativeContainers parameter was added
    console.log('WARNING: The createRecord arguments have changed to accept a single data parameter instead of multiple')
    data = {
      title: arguments[0],
      container: arguments[1],
      extension: arguments[2],
      fileData: arguments[3],
      alternativeContainers: [],
      callback: arguments[4],
      privacyLevel: 1
    }
  } else if (arguments.length === 6) {
    // Compatibility with usage after the alternativeContainers parameter was added
    console.log('WARNING: The createRecord arguments have changed to accept a single data parameter instead of multiple')
    data = {
      title: arguments[0],
      container: arguments[1],
      extension: arguments[2],
      fileData: arguments[3],
      alternativeContainers: arguments[4],
      callback: arguments[5]
    }
  }

  var options = {
    url: url + '/AddRecordToTrim?securityToken=' + token,
    method: 'post',
    body: {
      Title: data.title,
      Container: data.container,
      RecordExtension: data.extension,
      AlternativeContainers: data.alternativeContainers || [],
      Record: data.fileData,
      Privacy: data.privacyLevel || PRIVACY_LEVELS.PUBLIC
    },
    json: true
  }
  request(options, function (err, res, responseBody) {
    if (err) return callback(err)

    var trimRecordNo = responseBody.RecordNo

    if (!trimRecordNo) {
      debug('Invalid response %j', responseBody)
      return callback(new Error('Error uploading document to TRIM: Missing RecordNo response. ' + responseBody.message))
    }
    debug('Created record with recordNo %s', trimRecordNo)
    return callback(null, trimRecordNo)
  })
}

function createPublicRecord(data, callback) {
  return createRecord(R.merge(data, {privacyLevel: PRIVACY_LEVELS.PUBLIC}), callback)
}

function createPrivateRecord(data, callback) {
  return createRecord(R.merge(data, {privacyLevel: PRIVACY_LEVELS.PRIVATE}), callback)
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
 *
 * @param {String} method
 * @param {String} trimId
 * @param {containerCallback} callback
 */
function getContainerUsingMethod(method, trimId, callback) {
  var options = {
    url: url + '/' + method + '?trimid=' + trimId + '&securityToken=' + token,
    json: true
  };
  debug('GET %s', options.url);
  request.get(options, function (err, res, responseBody) {
    callback(err, responseBody);
  });
}

/**
 *
 * @param {String} trimId
 * @param {Number} [privacyLevel]
 * @param {containerCallback} callback
 * @return {*}
 */
function getContainer (trimId, privacyLevel, callback) {
  if (arguments.length === 2) {
    callback = privacyLevel
    privacyLevel = PRIVACY_LEVELS.PUBLIC
  }
  var method
  switch (privacyLevel) {
    case PRIVACY_LEVELS.PUBLIC:
      method = 'GetContainer'
      break
    case  PRIVACY_LEVELS.PRIVATE:
      method = 'getPrivateContainer'
      break
    default:
      return callback(new Error('Invalid privacyLevel: ' + privacyLevel))
  }
  return getContainerUsingMethod(method, trimId, token, callback)

}

function getPublicContainer (trimId, callback) {
  return getContainer(trimId, PRIVACY_LEVELS.PUBLIC, callback)
}

function getPrivateContainer (trimId, callback) {
  return getContainer(trimId, PRIVACY_LEVELS.PRIVATE, callback)
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
    PRIVACY_LEVELS: PRIVACY_LEVELS,
    getDocument: getDocument,
    createContainer: createContainer,
    createRecord: createRecord,
    createPublicRecord: createPublicRecord,
    createPrivateRecord: createPrivateRecord,

    getContainer: getContainer,
    getPublicContainer: getPublicContainer,
    getPrivateContainer: getPrivateContainer,

  }
}
