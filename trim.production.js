var request = require('request');
var assert = require('assert');
var debug = require('debug')('trim');
var RSVP = require('rsvp');
var url;
var token;

const Promise = RSVP.Promise;

/**
 * Define the callback from the `createRecord` method
 * @callback createRecordCallback
 * @param {Error}  error
 * @param {String} recordNo The TRIM RecordNo of the new document, if created.
 */


/**
 * @param {String} title
 * @param {String} container
 * @param {String} extension
 * @param {String} fileData
 * @return {Promise}
 */
function createRecord (title, container, extension, fileData) {
  return new Promise(function (resolve, reject) {
    var options = {
      url: url + '/AddRecordToTrim?securityToken=' + token,
      method: 'post',
      body: {
        Title: title,
        Container: container,
        RecordExtension: extension,
        Record: fileData
      },
      json: true
    }
    request(options, function (err, res, responseBody) {
      if (err) return reject(err);

      var trimRecordNo = responseBody.RecordNo;

      if (!trimRecordNo) {
        debug('Invalid response %j', responseBody);
        return reject(new Error('Error uploading document to TRIM: Missing RecordNo response. ' + responseBody.message));
      }
      debug('Created record with recordNo %s', trimRecordNo);
      return resolve(trimRecordNo)
    });
  })
}


/**
 * Get the actual document, not the TRIM record
 * @param trimId
 * @return {Promise}
 */
function getDocument (trimId) {
  return new Promise(function (resolve, reject) {
    var options = {
      url: url + '/get?id=' + trimId + '&securityToken=' + token
    }
    request.get(options, function (err, res, responseBody) {
      return (err) ? reject(err): resolve(responseBody);
    })
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
 * @return {Promise}
 */
function getContainer (trimId) {
  return new Promise(function (resolve, reject) {
    var options = {
      url: url + '/GetContainer?trimid=' + trimId + '&securityToken=' + token,
      json: true
    };
    debug('GET %s', options.url);
    request.get(options, function (err, res, responseBody) {
      // responseBody has containerNo, subContainers, and records
      return (err) ? reject(err): resolve(responseBody);
    });

  })
}


/**
 *
 * @param folderName
 * @param privacy
 * @param parentFolder
 * @return {Promise}
 */
function createContainer (folderName, privacy, parentFolder) {
  return new Promise(function (resolve, reject) {
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
      return (err) ? reject(err): resolve(responseBody);
    });
  })
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
