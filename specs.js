/* global Given, Then, describe */
var chai = require('chai')
var expect = chai.expect

var nock = require('nock')
var R = require('ramda-extended')

var VALID_TITLE = 'Some Title'
var INVALID_TITLE = null

var VALID_EXTENSION = 'pdf'
var INVALID_EXTENSION = '.pdf'

var VALID_ALTERNATIVE_CONTAINERS = ['SomeContainer']
var INVALID_ALTERNATIVE_CONTAINERS = null

var VALID_CONTAINER = 'oijsdoi'
var INVALID_CONTAINER = null

var VALID_FILEDATA = 'R0lGOD lhCwAOAMQfAP////7+/vj4+Hh4eHd3d/v7+/Dw8HV1dfLy8ubm5vX19e3t7fr'
var INVALID_FILEDATA = 'R0lGOD lhCwAOAMQfAP////7+/vj4+Hh4eHd3d/v7+/Dw8HV1dfLy8ubm5vX19e3t7fr'

describe('When using v2.2.1 or less', () => {
  var trim, mockURL, mockToken

  Given(() => mockURL = 'http://localhost')
  Given(() => mockToken = 'DEADBEEF')

  Given(() => {
    trim = require('./index')({
      url: mockURL,
      token: mockToken,
      mock: false
    })
  })

  describe('You should be able to call `createRecord` with 5 arguments (include alternativeContainers)', () => {
    var title, containerId, extensionType, fileData, alternativeContainers, createRecordMock

    Given(() => title = 'inside-out')
    Given(() => containerId = 'asdfjk')
    Given(() => extensionType = '.mp4')
    Given(() => alternativeContainers = ['himark'])
    Given(() => fileData = VALID_FILEDATA)

    var errReturn
    var dataReturn
    Given(() => {
      createRecordMock = nock(mockURL)
          .filteringRequestBody(R.always('*'))
          .post('/AddRecordToTrim', '*')
          .query({securityToken: mockToken})
          .reply(201, {RecordNo: '123456'})
    })
    When((done) => {
      trim.createRecord(title, containerId, extensionType, fileData, alternativeContainers, function (err, data) {
        errReturn = err
        dataReturn = data
        done()
      })
    })
    Then('it should be able to successfully use the function', (done) => {
      expect(errReturn).not.to.exist
      expect(dataReturn).to.exist
      expect(dataReturn).to.be.a('string')
      expect(dataReturn).to.equal('123456')
      createRecordMock.done()
      done()
    })

  })

  describe('You should be able to call `createRecord` with 4 arguments (no alternativeContainers)', () => {
    var title, containerId, extensionType, fileData, createRecordMock

    Given(() => title = 'inside-out')
    Given(() => containerId = 'asdfjk')
    Given(() => extensionType = '.mp4')
    Given(() => fileData = 'R0lGOD lhCwAOAMQfAP////7+/vj4+Hh4eHd3d/v7+/Dw8HV1dfLy8ubm5vX19e3t7fr')

    var errReturn
    var dataReturn
    Given(() => {
      createRecordMock = nock(mockURL)
          .filteringRequestBody(R.always('*'))
          .post('/AddRecordToTrim', '*')
          .query({securityToken: mockToken})
          .reply(201, {RecordNo: '123456'})
    })
    When((done) => {
      trim.createRecord(title, containerId, extensionType, fileData, function (err, data) {
        errReturn = err
        dataReturn = data
        done()
      })
    })
    Then('it should be able to successfully use the function', (done) => {
      expect(errReturn).not.to.exist
      expect(dataReturn).to.exist
      expect(dataReturn).to.be.a('string')
      expect(dataReturn).to.equal('123456')
      createRecordMock.done()
      done()
    })

  })

  describe('You should be able to call `createContainer` with 4 arguments (no alternativeContainers)', () => {
    var createContainerMock, folder, parentFolder, privacySetting
    var dataReturn
    var errReturn

    Given(() => folder = 'someFolder')
    Given(() => parentFolder = 'someParentFolder')
    Given(() => privacySetting = 'jamesBond')
    Given(() => {
      createContainerMock = nock(mockURL)
          .filteringRequestBody(R.always('*'))
          .post('/CreateContainer', '*')
          .query({securityToken: mockToken})
          .reply(201, {
            msg: 'create response' // TODO determine the shape of the response
          })
    })
    When((done) => {
      trim.createContainer(folder, privacySetting, parentFolder, function (err, data) {
        errReturn = err
        dataReturn = data
        done()
      })
    })
    Then('it should be able to successfully use the function', (done) => {
      expect(errReturn).not.to.exist
      expect(dataReturn).to.exist
      createContainerMock.done()
      done()
    })
  })

})

describe('When using trimperson api', () => {
  var trim
  var mockURL
  var mockToken

  Given(() => mockURL = 'http://localhost')
  Given(() => mockToken = 'DEADBEEF')

  Given(() => {
    trim = require('./index')({
      url: mockURL,
      token: mockToken,
      mock: false
    })
  })

  Then('it should have created a trimperson object', (done) => {
    expect(trim).to.be.a('object')
    done()
  })

  Then('Unit test: isValidPrivacyLevel', (done) => {
    expect(trim.isValidPrivacyLevel(trim.PRIVACY_LEVELS.PUBLIC)).to.equal(true)
    expect(trim.isValidPrivacyLevel(trim.PRIVACY_LEVELS.PRIVATE)).to.equal(true)
    expect(trim.isValidPrivacyLevel(3)).to.equal(false)
    done()
  })


  /*
   CONSTANTS
   */
  describe('Privacy constants should be available', () => {
    Then('`PRIVACY_LEVELS` should exist', (done) => {
      expect(trim.PRIVACY_LEVELS).to.be.a('object')
      done()
    })
    Then('`PRIVACY_LEVELS` should have the correct PUBLIC value', (done) => {
      expect(trim.PRIVACY_LEVELS.PUBLIC).to.equal(1)
      done()
    })
    Then('`PRIVACY_LEVELS` should have the correct PRIVATE value', (done) => {
      expect(trim.PRIVACY_LEVELS.PRIVATE).to.equal(2)
      done()
    })
  })

  /*
   CREATE RECORD
   */
  describe('To create a record', () => {

    Then('`createRecord` should be a function', (done) => {
      expect(trim.createRecord).to.be.a('function')
      done()
    })
    Then('`createPublicRecord` should be a function', (done) => {
      expect(trim.createPublicRecord).to.be.a('function')
      done()
    })
    Then('`createPrivateRecord` should be a function', (done) => {
      expect(trim.createPrivateRecord).to.be.a('function')
      done()
    })
    describe('Using the `createRecord` function', () => {

      describe('When the request succeeds', () => {
        var data, errReturn, dataReturn, createRecordMock
        Given(() => data = {
          title: VALID_TITLE,
          container: VALID_CONTAINER,
          extension: VALID_EXTENSION,
          fileData: VALID_FILEDATA,
          alternativeContainers: VALID_ALTERNATIVE_CONTAINERS,
          privacyLevel: trim.PRIVACY_LEVELS.PUBLIC
        })
        Given(() => {
          createRecordMock = nock(mockURL)
              .filteringRequestBody(R.always('*'))
              .post('/AddRecordToTrim', '*')
              .query({securityToken: mockToken})
              .reply(201, {
                RecordNo: '097097234'
              })
        })

        When(done => {
          trim.createRecord(data, (err, data) => {
            errReturn = err
            dataReturn = data
            done()
          })
        })

        Then('It should return the container', (done) => {
          expect(errReturn).not.to.exist
          expect(dataReturn).to.be.a('string')
          expect(dataReturn).to.equal('097097234')
          createRecordMock.done()
          done()
        })
      })

      describe('When the request fails', () => {
        var errReturn, dataReturn, data

        Given(() => data = {
          title: VALID_TITLE,
          container: VALID_CONTAINER,
          extension: VALID_EXTENSION,
          fileData: VALID_FILEDATA,
          alternativeContainers: VALID_ALTERNATIVE_CONTAINERS,
          privacyLevel: trim.PRIVACY_LEVELS.PUBLIC
        })
        Given(() => {
          createRecordMock = nock(mockURL)
              .filteringRequestBody(R.always('*'))
              .post('/AddRecordToTrim', '*')
              .query({securityToken: mockToken})
              .reply(500, {message: 'An error has occurred.'})
        })
        When((done) => {
          trim.createRecord(data, function (err, data) {
            errReturn = err
            dataReturn = data
            done()
          })
        })
        Then('It should return an error', (done) => {
          expect(errReturn).to.exist
          expect(dataReturn).not.to.exist
          createRecordMock.done()
          done()
        })
      })
    })


  })

  /*
   GET RECORD
   */
  describe('To get a single record', () => {
    Then('`getDocument` should be a function', (done) => {
      expect(trim.getDocument).to.be.a('function')
      done()
    })

    describe('When the record exists', () => {
      var documentId, getDocumentMock, dataReturn, errReturn

      Given(() => documentId = 'someIDthatPointsToADocument')
      Given(() => {
        getDocumentMock = nock(mockURL)
            .get('/get')
            .query({id: documentId, securityToken: mockToken})
            .reply(200, VALID_FILEDATA)
      })

      When((done) => {
        trim.getDocument(documentId, function (err, data) {
          dataReturn = data
          errReturn = err
          done()
        })
      })

      Then('It should return a document', (done) => {
        expect(errReturn).not.to.exist
        expect(dataReturn).to.equal(VALID_FILEDATA)
        getDocumentMock.done()
        done()
      })
    })
    describe('When the record doesnt exist', () => {
      var documentId, getDocumentMock, dataReturn, errReturn

      Given(() => documentId = 'someIDthatPointsToADocument')
      Given(() => {
        getDocumentMock = nock(mockURL)
            .get('/get')
            .query({id: documentId, securityToken: mockToken})
            .reply(404, '')
      })

      When((done) => {
        trim.getDocument(documentId, function (err, data) {
          dataReturn = data
          errReturn = err
          done()
        })
      })

      Then('It should return an error', (done) => {
        expect(errReturn).to.exist
        expect(dataReturn).not.to.exist
        getDocumentMock.done()
        done()
      })
    })
  })

      describe('When the request succeeds', () => {
        Then('It should return the container', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
      describe('When the request fails', () => {
        Then('It should fail gracefully', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
    })

  })

  /*
   GET CONTAINER
   */
  describe('To get a container', () => {
    Then('`getContainer` should be a function', (done) => {
      expect(trim.getContainer).to.be.a('function')
      done()
    })
    Then('`getPublicContainer` should be a function', (done) => {
      expect(trim.getPublicContainer).to.be.a('function')
      done()
    })
    Then('`getPrivateContainer` should be a function', (done) => {
      expect(trim.getPrivateContainer).to.be.a('function')
      done()
    })

    describe('If the public container is requested', () => {
      var getContainerMock
      Given(() => {
        getContainerMock = nock(mockURL)
            .get('/GetContainer')
            .query({trimid: VALID_CONTAINER, securityToken: mockToken})
            .reply(200)
      })
      When(done => {
        trim.getContainer(VALID_CONTAINER, trim.PRIVACY_LEVELS.PUBLIC, () => done())
      })
      Then('`/getContainer` is called', done => {
        getContainerMock.done()
        done()
      })
    })

    describe('If the private container is requested', () => {
      var getContainerMock
      Given(() => {
        getContainerMock = nock(mockURL)
            .get('/getPrivateContainer')
            .query({trimid: VALID_CONTAINER, securityToken: mockToken})
            .reply(200)
      })
      When(done => {
        trim.getContainer(VALID_CONTAINER, trim.PRIVACY_LEVELS.PRIVATE, () => done())
      })
      Then('`/getPrivateContainer` is called', done => {
        getContainerMock.done()
        done()
      })
    })

    describe('If no privacy level is supplied', () => {
      var getContainerMock
      Given(() => {
        getContainerMock = nock(mockURL)
            .get('/GetContainer')
            .query({trimid: VALID_CONTAINER, securityToken: mockToken})
            .reply(200)
      })
      When(done => {
        trim.getContainer(VALID_CONTAINER, () => done())
      })
      Then('The public container is requested', done => {
        getContainerMock.done()
        done()
      })
    })

    describe('With escalated permissions and an invalid token', () => {
      var getContainerMock, dataReturn, errReturn
      Given(() => {
        getContainerMock = nock(mockURL)
            .get('/getPrivateContainer')
            .query({trimid: VALID_CONTAINER, securityToken: mockToken})
            .reply(401, {
              message: 'Authorization has been denied for this request.'
            })
      })
      When(done => {
        trim.getContainer(VALID_CONTAINER, trim.PRIVACY_LEVELS.PRIVATE, (err, data) => {
          errReturn = err
          dataReturn = data
          done()
        })
      })
      Then('It should return an error', done => {
        expect(errReturn).to.exist
        expect(dataReturn).not.to.exist
        getContainerMock.done()
        done()
      })
    })

    describe('When the container exists', () => {
      var getContainerMock, dataReturn, errReturn

      Given(() => {
        getContainerMock = nock(mockURL)
            .get('/GetContainer')
            .query({trimid: VALID_CONTAINER, securityToken: mockToken})
            .reply(200, {
              containerNo: 'someid',
              subContainers: []
            })
      })

      When((done) => {
        trim.getContainer(VALID_CONTAINER, trim.PRIVACY_LEVELS.PUBLIC, (err, data) => {
          dataReturn = data
          errReturn = err
          done()
        })
      })

      Then('It should return the container', (done) => {
        expect(errReturn).not.to.exist
        expect(dataReturn).to.be.a('object')
        expect(dataReturn.containerNo).to.equal('someid')
        expect(dataReturn.subContainers).to.be.a('array')
        getContainerMock.done()
        done()
      })

    })
    describe('When the container doesnt exist', () => {
      var getContainerMock, dataReturn, errReturn

      Given(() => {
        getContainerMock = nock(mockURL)
            .get('/GetContainer')
            .query({trimid: VALID_CONTAINER, securityToken: mockToken})
            .reply(200, null)
      })

      When((done) => {
        trim.getContainer(VALID_CONTAINER, trim.PRIVACY_LEVELS.PUBLIC, (err, data) => {
          dataReturn = data
          errReturn = err
          done()
        })
      })

      Then('It should return an error', (done) => {
        expect(errReturn).to.exist
        expect(dataReturn).not.to.exist
        getContainerMock.done()
        done()
      })
    })

  })

  describe('when using the createContainer function', () => {
    var createContainerMock, folder, parentFolder, privacySetting
    var dataReturn
    var errReturn

    Given(() => folder = 'someFolder')
    Given(() => parentFolder = 'someParentFolder')
    Given(() => privacySetting = 'jamesBond')
    Given(() => {
      createContainerMock = nock(mockURL)
          .filteringRequestBody(R.always('*'))
          .post('/CreateContainer', '*')
          .query({securityToken: mockToken})
          .reply(201, {
            msg: 'create response' // TODO determine the shape of the response
          })
    })
    When((done) => {
      trim.createContainer(folder, privacySetting, parentFolder, function (err, data) {
        errReturn = err
        dataReturn = data
        done()
      })
    })
    Then('it should be able to create a container', (done) => {
      expect(errReturn).not.to.exist
      expect(dataReturn).to.exist
      createContainerMock.done()
      done()
    })
  })

  describe('when using the createRecord function', () => {
    var title, containerId, extensionType, alternativeContainers, fileData

    Given(() => title = 'inside-out')
    Given(() => containerId = 'asdfjk')
    Given(() => extensionType = '.mp4')
    Given(() => alternativeContainers = ['himark'])
    Given(() => fileData = 'R0lGOD lhCwAOAMQfAP////7+/vj4+Hh4eHd3d/v7+/Dw8HV1dfLy8ubm5vX19e3t7fr')

    describe('when the backend accepts the record', () => {
    })

    describe('when the TRIM fails to recieve a createRecord request', () => {
      var errReturn
      var dataReturn
      Given(() => {
        createRecordMock = nock(mockURL)
            .filteringRequestBody(R.always('*'))
            .post('/AddRecordToTrim', '*')
            .query({securityToken: mockToken})
            .reply(500, {msg: 'it failed'})
      })
      When((done) => {
        trim.createRecord(title, containerId, extensionType, fileData, alternativeContainers, function (err, data) {
          errReturn = err
          dataReturn = data
          done()
        })
      })
      Then('it should fail when TRIM responds without a record number number', (done) => {
        expect(errReturn).to.exist
        expect(dataReturn).not.to.exist
        createRecordMock.done()
        done()
      })
    })
  })
})
