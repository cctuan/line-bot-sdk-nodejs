'use strict'

require('should')
const sinon = require('sinon')
const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const describe = lab.experiment
// var before = lab.before
const beforeEach = lab.beforeEach
const afterEach = lab.afterEach
const it = lab.test

const CONTENT_TYPES = require('./../lib/constants/ContentType')
const EVENT_TYPES = require('./../lib/constants/EventType')
const BodyParser = require('./../lib/bodyParser')
const API = require('./../lib/api')

describe('BodyParser', () => {
  let bodyParser
  let _s
  let api
  beforeEach(done => {
    api = new API({})
    _s = sinon.sandbox.create()
    bodyParser = new BodyParser({}, api)
    done()
  })

  afterEach(done => {
    _s.restore()
    done()
  })

  it('eventParser: POSTBACK', done => {
    let test = {
      type: EVENT_TYPES.POSTBACK
    }
    Code.expect(bodyParser.eventParser(test)).to.equal(test)
    done()
  })

  it('eventParser: BEACON', done => {
    let test = {
      type: EVENT_TYPES.BEACON
    }
    Code.expect(bodyParser.eventParser(test)).to.equal(test)
    done()
  })

  it('eventParser: FOLLOW', done => {
    let test = {
      type: EVENT_TYPES.FOLLOW
    }
    Code.expect(bodyParser.eventParser(test)).to.equal(test)
    done()
  })

  it('eventParser: MESSAGE - IMAGE - success get rawdata', done => {
    const testBody = 'testbody'

    _s.stub(api, 'getMessageContent').returns(Promise.resolve({
      status: 200,
      body: testBody
    }))

    let test = {
      type: EVENT_TYPES.MESSAGE,
      message: {
        type: CONTENT_TYPES.IMAGE,
        id: 12345667
      }
    }

    bodyParser.eventParser(test).message.contentGetter().then(result => {
      Code.expect(result).to.equal(testBody)
      done()
    })
  })

  it('eventParser: MESSAGE - IMAGE - error response status', done => {
    _s.stub(api, 'getMessageContent').returns(Promise.resolve({
      status: 400
    }))

    let test = {
      type: EVENT_TYPES.MESSAGE,
      message: {
        type: CONTENT_TYPES.IMAGE,
        id: 12345667
      }
    }

    bodyParser.eventParser(test).message.contentGetter().then(result => {
      Code.fail('This should not occur')
      done()
    }).catch(e => {
      done()
    })
  })

  it('parse: wrong type of parse data', done => {
    let test = {
    }
    Code.expect(bodyParser.parse(test).length).to.equal(0)
    done()
  })

  it('parse: parse correct json format', done => {
    let test = {
      events: [
        {
          type: EVENT_TYPES.MESSAGE,
          message: {
            type: CONTENT_TYPES.IMAGE,
            id: 123
          }
        },
        {
          type: EVENT_TYPES.MESSAGE,
          message: {
            type: CONTENT_TYPES.IMAGE,
            id: 456
          }
        }
      ]
    }
    const parsedResult = bodyParser.parse(test)
    Code.expect(parsedResult.length).to.equal(2)
    Code.expect(parsedResult[0]).to.equal(test.events[0])
    done()
  })
})
