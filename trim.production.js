var request = require('request');
var assert = require('assert');
var debug = require('debug')('trim');
var R = require('ramda-extended');
var url;
var token;


/**
 * Define the callback from the `createRecord` method
 * @callback createRecordCallback
 * @param {Error}  error
 * @param {String} recordNo The TRIM RecordNo of the new document, if created.
 */

/**
 *
 * @param {Object} body
 * @param {String} body.Title
 * @param {String} body.Container
 * @param {String} body.RecordExtension
 * @param {String[]} body.AlternativeContainers
 * @param {String} body.Record
 * @return {String|null} Error message. null if no errors are found
 */
function getCreateRecordBodyErrors(body) {

  if (!body.Title) return 'A title is required'

  if (!body.Container) return 'A container is required'

  if (!body.RecordExtension) return 'An extension is required'
  if (!R.test(/^[a-zA-Z]+$/, body.RecordExtension)) return 'Record extensions must only contain letters'

  // a dataUrl header ends with a comma
  const isProbablyDataUrl = R.pipe(
      R.slice(0, 200),  // prevent checking the *entire* string
      R.contains(',')
  )
  const validBase64Characters = /^[A-Za-z0-9+/=]+$/
  if (!body.Record) return 'A file is required'
  if (isProbablyDataUrl(body.Record)) return 'Record must be a base64 encoded string, not a dataUrl'
  if (!R.test(validBase64Characters, body.Record)) return 'The file is not valid'

  if (!R.isArrayLike(body.AlternativeContainers)) return 'alternativeContainers must be a list of strings'

  return null
}

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
    return callback(new Error('Migration Error: a new parameter was added: alternativeContainers'))
  }

  const body = {
    Title: title,
    Container: container,
    RecordExtension: extension,
    AlternativeContainers: alternativeContainers || [],
    Record: fileData
  }

  let errorMessage = getCreateRecordBodyErrors(body)
  if (errorMessage) return callback(new Error(errorMessage))


  const options = {
    url: url + '/AddRecordToTrim?securityToken=' + token,
    method: 'post',
    body: body,
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

function getContainerUsingMethod(method, trimId, securityToken, callback) {
  var options = {
    url: url + '/' + method + '?trimid=' + trimId + '&securityToken=' + securityToken,
    json: true
  };
  debug('GET %s', options.url);
  request.get(options, function (err, res, responseBody) {
    callback(err, responseBody);
  });
}

/**
 * @param trimId
 * @param {containerCallback}  callback
 */
function getContainer (trimId, callback) {
  getContainerUsingMethod('GetContainer', trimId, token, callback);
}

/**
 * @param trimId
 * @param {containerCallback}  callback
 */
function getPrivateContainer (trimId, callback) {
  getContainerUsingMethod('getPrivateContainer', trimId, token, callback);
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
    createRecord: createRecord,
    getPrivateContainer: getPrivateContainer
  }
}
