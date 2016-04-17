/* global Given, Then, describe */
var expect = require('chai').expect
var nock = require('nock')
var R = require('ramda-extended')


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
    describe('Using the createRecord function', () => {
      Then('createRecord should be a function', (done) => {
        expect(trim.createRecord).to.be.a('function')
        done()
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

    describe('Using the createPublicRecord function', () => {
      Then('createPublicRecord should be a function', (done) => {
        expect(trim.createPublicRecord).to.be.a('function')
        done()
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

    describe('Using the createPrivateRecord function', () => {
      Then('createPrivateRecord should be a function', (done) => {
        expect(trim.createPrivateRecord).to.be.a('function')
        done()
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
  GET RECORD
   */
  describe('To get a single record', () => {
    Then('`getDocument` should be a function', (done) => {
      expect(trim.getDocument).to.be.a('function')
      done()
    })

    describe('When the record exists', () => {
      var documentId
      var getDocumentMock
      var dataReturn
      var errReturn

      Given(() => documentId = 'someIDthatPointsToADocument')
      Given(() => {
        getDocumentMock = nock(mockURL)
            .get('/get')
            .query({id: documentId, securityToken: mockToken})
            .reply(200, 'R0lGOD lhCwAOAMQfAP////7+/vj4+Hh4eHd3d/v7+/Dw8')
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
        expect(dataReturn).to.exist
        getDocumentMock.done()
        done()
      })
    })
    describe('When the record doesnt exist', () => {
      Then('It should fail gracefully', (done) => {
        throw new Error('What happens when we cant find a record')
        done()
      })
    })
  })

  /*
  CREATE CONTAINER
   */
  describe('To create a container', () => {
    describe('Using the createContainer function', () => {
      Then('createContainer should be a function', (done) => {
        expect(trim.createContainer).to.be.a('function')
        done()
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

    describe('Using the createPublicContainer function', () => {
      Then('createPublicContainer should be a function', (done) => {
        expect(trim.createPublicContainer).to.be.a('function')
        done()
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

    describe('Using the createPrivateContainer function', () => {
      Then('createPrivateContainer should be a function', (done) => {
        expect(trim.createPrivateContainer).to.be.a('function')
        done()
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
    describe('Using the `getContainer` function', () => {
      Then('`getContainer` should be a function', (done) => {
        expect(trim.getContainer).to.be.a('function')
        done()
      })

      describe('When the container exists', () => {
        Then('It should return the container', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
      describe('When the container doesnt exist', () => {
        Then('It should fail gracefully', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
    })

    describe('Using the `getPublicContainer` function', () => {
      Then('`getPublicContainer` should be a function', (done) => {
        expect(trim.getPublicContainer).to.be.a('function')
        done()
      })
      describe('When the container exists', () => {
        Then('It should return the container', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
      describe('When the container doesnt exist', () => {
        Then('It should fail gracefully', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
    })

    describe('Using the `getPrivateContainer` function', () => {
      Then('`getPrivateContainer` should be a function', (done) => {
        expect(trim.getPrivateContainer).to.be.a('function')
        done()
      })
      describe('When the container exists', () => {
        Then('It should return the container', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
      describe('When the container doesnt exist', () => {
        Then('It should fail gracefully', (done) => {
          throw new Error('Not implemented')
          done()
        })
      })
    })

  })

  describe('using the `getContainer` function', () => {

    describe('when invoking the `getContainer` funciton', () => {
      var getContainerMock
      var fakeID = 'fakecontainerid'
      var dataReturn
      var errReturn

      Given(() => {
        getContainerMock = nock(mockURL)
            .get('/GetContainer')
            .query({trimid: fakeID, securityToken: mockToken})
            .reply(200, {
              containerNo: 'someid',
              subContainers: []
            })
      })

      When((done) => {
        trim.getContainer(fakeID, (err, data) => {
          dataReturn = data
          errReturn = err
          done()
        })
      })

      Then('it should resolve without error', (done) => {
        expect(errReturn).not.to.exist
        expect(dataReturn).to.exist
        expect(dataReturn.containerNo).to.equal('someid')
        expect(dataReturn.subContainers).to.be.a('array')
        getContainerMock.done() // throws an error if no request was recorded
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
