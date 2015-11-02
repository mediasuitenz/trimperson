var describe = require('mocha').describe
var it = require('mocha').it
var beforeEach = require('mocha').beforeEach
var expect = require('chai').expect
var nock = require('nock')

var mockURL = 'http://localhost'
var mockToken = 'DEADBEEF'

// setup mock for trimperson api

describe('when using trimperson api', function () {
  var trim

  beforeEach(function () {
    trim = require('./index')({
      url: mockURL,
      token: mockToken,
      mock: false
    })
  })

  it('should create a trimperson object', function () {
    expect(trim).to.be.a('object')
  })

  describe('when using the getContainer function', function () {
    it('should exist on the trim instance', function () {
      expect(trim.getContainer).to.be.a('function')
    })

    it('should getContainer and execute the callback', function (done) {
      var fakeID = 'fakecontainerid'

      var getContainerMock = nock(mockURL)
        .get('/GetContainer')
        .query({trimid: fakeID, securityToken: mockToken})
        .reply(200, {
          containerNo: 'someid',
          subContainers: []
        })

      trim.getContainer(fakeID, function (err, data) {
        expect(err).to.be.an('null')
        expect(data).not.to.be.a('undefined')

        expect(data.containerNo).to.equal('someid')
        expect(data.subContainers).to.be.a('array')
        getContainerMock.done() // throws an error if no request was recorded
        done()
      })
    })
  })

  describe('when using the getDocument function', function () {
    it('should exist on the trim instance', function () {
      expect(trim.getDocument).to.be.a('function')
    })

    it('should getDocument succesfully', function (done) {
      var documentId = 'someIDthatPointsToADoucment'
      var getDocumentMock = nock(mockURL)
        .get('/get')
        .query({id: documentId, securityToken: mockToken})
        .reply(200, {
          msg: 'response' // TODO what shape object does getDocument actually return
        })

      trim.getDocument(documentId, function (err, data) {
        expect(err).to.be.an('null')
        expect(data).not.to.be.an('undefined')

        getDocumentMock.done()
        done()
      })
    })
  })

  describe('when using the createContainer function', function () {
    it('should exist on the trim instance', function () {
      expect(trim.createContainer).to.be.a('function')
    })

    it('should be able to create a container', function (done) {
      var createContainerMock = nock(mockURL)
        .filteringRequestBody(function (body) {
          return '*' // this allows us to ignore the contents of the post for this asertion
        })
        .post('/CreateContainer', '*')
        .query({ securityToken: mockToken })
        .reply(201, {
          msg: 'create response' // TODO determine the shape of the response
        })

      trim.createContainer('someFolderName', 'somePrivacySetting', 'someParentFolder', function (err, data) {
        expect(err).to.be.a('null')
        expect(data).not.to.be.a('undefined')

        createContainerMock.done()
        done()
      })
    })
  })

  describe('when using the createRecord function', function () {
    it('should exist on the trim instance', function () {
      expect(trim.createRecord).to.be.a('function')
    })

    it('should be able to succesfully use the function', function (done) {
      var createRecordMock = nock(mockURL)
        .filteringRequestBody(function (bodyt) {
          return '*'
        })
        .post('/AddRecordToTrim', '*')
        .query({ securityToken: mockToken })
        .reply(201, { RecordNo: '123456' })

      trim.createRecord('newTitle', 'containerID', 'extensiontype', 'fileData', function (err, data) {
        expect(err).to.be.an('null')
        expect(data).not.to.be.an('undefined')

        expect(data).to.be.a('string')
        expect(data).to.equal('123456')
        createRecordMock.done()
        done()
      })
    })

    it('should fail when TRIM responds without a record number number', function (done) {
      var createRecordMock = nock(mockURL)
        .filteringRequestBody(function (bodyt) {
          return '*'
        })
        .post('/AddRecordToTrim', '*')
        .query({ securityToken: mockToken })
        .reply(500, { msg: 'it failed wtfomg' }) // determine shape of response

      trim.createRecord('newTitle', 'containerID', 'extensiontype', 'fileData', function (err, data) {
        expect(err).not.to.be.an('null')
        expect(data).to.be.an('undefined')

        createRecordMock.done()
        done()
      })
    })
  })
})
