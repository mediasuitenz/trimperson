/* global Given, Then, describe */
var expect = require('chai').expect
var nock = require('nock')

describe('when using trimperson api', () => {
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

  Then('it should have created a trimperson object', () => expect(trim).to.be.a('object'))

  describe('using the getContainer function', () => {
    Then('the function should exist on the trim instance', () => expect(trim.getContainer).to.be.a('function'))

    describe('when invoking the getContainer funciton', () => {
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

      Then('it should resolve without error', () => {
        expect(errReturn).not.to.exist
        expect(dataReturn).to.exist
        expect(dataReturn.containerNo).to.equal('someid')
        expect(dataReturn.subContainers).to.be.a('array')
        getContainerMock.done() // throws an error if no request was recorded
      })
    })
  })

  describe('when using the getDocument function', () => {
    var documentId
    var getDocumentMock
    var dataReturn
    var errReturn

    Given(() => documentId = 'someIDthatPointsToADocument')
    Given(() => {
      getDocumentMock = nock(mockURL)
        .get('/get')
        .query({id: documentId, securityToken: mockToken})
        .reply(200, 'data:video/mp4;base64,R0lGOD lhCwAOAMQfAP////7+/vj4+Hh4eHd3d/v7+/Dw8')
    })

    When((done) => {
      trim.getDocument(documentId, function (err, data) {
        dataReturn = data
        errReturn = err
        done()
      })
    })

    Then('it should getDocument succesfully', () => {
      expect(errReturn).not.to.exist
      expect(dataReturn).to.exist
      getDocumentMock.done()
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
        .filteringRequestBody(function (body) {
          return '*' // this allows us to ignore the contents of the post for this asertion
        })
        .post('/CreateContainer', '*')
        .query({ securityToken: mockToken })
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
    Then('it should be able to create a container', () => {
      expect(errReturn).not.to.exist
      expect(dataReturn).to.exist
      createContainerMock.done()
    })
  })

  describe('when using the createRecord function', () => {
    var title, containerId, extensionType, fileData, createRecordMock

    Given(() => title = 'inside-out')
    Given(() => containerId = 'asdfjk')
    Given(() => extensionType = '.mp4')
    Given(() => fileData = 'data:video/mp4;base64,R0lGOD lhCwAOAMQfAP////7+/vj4+Hh4eHd3d/v7+/Dw8HV1dfLy8ubm5vX19e3t7fr')

    describe('when the backend accepts the record', () => {
      var errReturn
      var dataReturn
      Given(() => {
        createRecordMock = nock(mockURL)
          .filteringRequestBody(function (bodyt) {
            return '*'
          })
          .post('/AddRecordToTrim', '*')
          .query({ securityToken: mockToken })
          .reply(201, { RecordNo: '123456' })
      })
      When((done) => {
        trim.createRecord(title, containerId, extensionType, fileData, function (err, data) {
          errReturn = err
          dataReturn = data
          done()
        })
      })
      Then('it should be able to succesfully use the function', () => {
        expect(errReturn).not.to.exist
        expect(dataReturn).to.exist
        expect(dataReturn).to.be.a('string')
        expect(dataReturn).to.equal('123456')
        createRecordMock.done()
      })

    })

    describe('when the TRIM fails to recieve a createRecord request', () => {
      var errReturn
      var dataReturn
      Given(() => {
        createRecordMock = nock(mockURL)
          .filteringRequestBody(function (bodyt) {
            return '*'
          })
          .post('/AddRecordToTrim', '*')
          .query({ securityToken: mockToken })
          .reply(500, { msg: 'it failed wtfomg' })
      })
      When((done) => {
        trim.createRecord(title, containerId, extensionType, fileData, function (err, data) {
          errReturn = err
          dataReturn = data
          done()
        })
      })
      Then('it should fail when TRIM responds without a record number number', () => {
        expect(errReturn).to.exist
        expect(dataReturn).not.to.exist
        createRecordMock.done()
      })
    })
  })
})
