var request = require('request')
var assert = require('assert')
var debug = require('debug')('trim')
var R = require('ramda-extended')
var url
var token
var testing

var PRIVACY = {
  PUBLIC: 1,
  PRIVATE: 2
}

var isValidPrivacyLevel = R.contains(R.__, R.values(PRIVACY))

function deprecationWarning(warning) {
  if (!testing) {
    console.log('DEPRECATION WARNING: ', warning)
  }
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
 * @param {Boolean}   data.privacyLevel public=1, private=2 -- higher numbers escalate privacy level
 * @param {createRecordCallback}  callback
 */
function createRecord(data, callback) {
  if (arguments.length === 5) {
    // Compatibility with usage before the alternativeContainers parameter was added
    deprecationWarning('The createRecord arguments have changed to accept a single data parameter instead of multiple')
    data = {
      title: arguments[0],
      container: arguments[1],
      extension: arguments[2],
      fileData: arguments[3],
      alternativeContainers: [],
      privacyLevel: 1
    }
    callback = arguments[4]
  } else if (arguments.length === 6) {
    // Compatibility with usage after the alternativeContainers parameter was added
    deprecationWarning('The createRecord arguments have changed to accept a single data parameter instead of multiple')
    data = {
      title: arguments[0],
      container: arguments[1],
      extension: arguments[2],
      fileData: arguments[3],
      alternativeContainers: arguments[4]
    }
    callback = arguments[5]
  }
  if (data.privacyLevel != null && !isValidPrivacyLevel(data.privacyLevel)) {
    return callback(new Error('Invalid privacy level: ' + data.privacyLevel))
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
      Privacy: data.privacyLevel || PRIVACY.PUBLIC
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
    if (res.statusCode === 404) {
      return callback(new Error('Not found'))
    }
    callback(err, responseBody)
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
  }
  debug('GET %s', options.url)
  request.get(options, function (err, res, responseBody) {
    if (err) {
      callback(err)
    } else if (res.statusCode === 401) {
      callback(new Error('Unauthorized'))
    } else if (responseBody == null) {
      callback(new Error('Not Found'))
    } else {
      callback(err, responseBody)
    }
  })
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
    privacyLevel = PRIVACY.PUBLIC
  }
  var method
  switch (privacyLevel) {
    case PRIVACY.PUBLIC:
      method = 'GetContainer'
      break
    case  PRIVACY.PRIVATE:
      method = 'getPrivateContainer'
      break
    default:
      return callback(new Error('Invalid privacyLevel: ' + privacyLevel))
  }
  return getContainerUsingMethod(method, trimId, callback)
}

function getPrivateContainer (trimId, callback) {
  deprecationWarning('getPrivateContainer is deprecated. Use getContainer and pass a privacy level instead.')
  return getContainer(trimId, PRIVACY.PRIVATE, callback)
}


/**
 * @callback createContainerCallback
 * @param {Error} error
 * @param {Object} response
 * @param {String} response.RecordNo
 */

/**
 * @param {Object} data
 * @param {String} data.folderName the RecordNo
 * @param {Number} data.privacyLevel
 * @param {String} [data.parentFolder]
 * @param {String} [data.title] Display title? Not actually sure what this does
 * @param {createContainerCallback} callback
 */
function createContainer (data, callback) {
  if (arguments.length === 4) {
    // Compatibility with old api
    data = {
      folderName: arguments[0],
      privacyLevel: arguments[1],
      parentFolder: arguments[2]
    }
    callback = arguments[3]
  }
  var body = {
    RecordNo: data.folderName,
    Title: data.title || data.folderName,
    Privacy: data.privacyLevel || PRIVACY.PUBLIC,
    ParentFolder: data.parentFolder
  }
  // parentFolder currently returns a 500 error
  var options = {
    url: url + '/CreateContainer?securityToken=' + token,
    json: body
  }

  request.post(options, function (err, res, responseBody) {
    if (err) {
      callback(err)
    } else if (res.statusCode === 401) {
      callback(new Error('Unauthorized'))
    } else if (parseInt(res.statusCode / 100, 10) === 5) {
      callback(new Error('Server Error'))
    } else if (responseBody && !responseBody.RecordNo) {
      callback(new Error('Error creating container'))
    } else if (res.statusCode === 204) {
      // if no response body, then the container already existed... what do we do?
      // TODO: Don't know if this is the best course of action...
      callback(null, {RecordNo: data.folderName})
    } else {
      callback(null, responseBody)
    }
  })
}

/**
 *
 * @param {Object} options configuration options
 * @param {String} options.url Base TRIM url
 * @param {String} options.token TRIM securityToken
 * @param {Boolean} options.debug If true, then require `request-debug`
 * @param {Boolean} options.testing Hide deprecation warnings
 * @return {*}
 */
module.exports = function (options) {

  assert(typeof options.url === 'string', 'TRIM wrapper must have a valid `url` argument.')
  assert(typeof options.token === 'string', 'TRIM wrapper must have a valid `token` argument.')

  url = options.url
  token = options.token
  testing = options.testing
  if (!!options.debug)
    require('request-debug')(request)

  return {
    PRIVACY: PRIVACY,
    isValidPrivacyLevel: isValidPrivacyLevel,

    getDocument: getDocument,
    createRecord: createRecord,

    getContainer: getContainer,
    createContainer: createContainer,

    // deprecations
    getPrivateContainer: getPrivateContainer

  }
}
