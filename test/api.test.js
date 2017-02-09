'use strict'

require('should')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const describe = lab.experiment
const beforeEach = lab.beforeEach
const afterEach = lab.afterEach
const it = lab.test

// const LIMITS = require('./../lib/constants/Limit')
const ENDPOINTS = require('./../lib/constants/Endpoint')

const MockRequest = {
  _reset () {
    MockRequest.url = null
    MockRequest._response = null
    MockRequest.setted = null
    MockRequest.sentData = null
  },
  _setRequestSuccess (shouldSuccess) {
    MockRequest._shouldSuccess = shouldSuccess
  },
  _setResponse (response) {
    MockRequest._response = response
  },
  post (url) {
    MockRequest.url = url
    return MockRequest
  },
  get (url) {
    MockRequest.url = url
    return MockRequest
  },
  set (setted) {
    MockRequest.setted = setted
    return MockRequest
  },
  send (sentData) {
    MockRequest.sentData = sentData
    if (MockRequest._shouldSuccess) {
      return Promise.resolve(MockRequest._response)
    } else {
      return Promise.reject(MockRequest._response)
    }
  },
  end () {
    if (MockRequest._shouldSuccess) {
      return Promise.resolve(MockRequest._response)
    } else {
      return Promise.reject(MockRequest._response)
    }
  }
}

const API = proxyquire('./../lib/api', {
  'superagent-promise': () => MockRequest
})

describe('API', () => {
  let fakeChannelAccessToken = 'fakeChannelAccessToken'
  let api
  let _s

  beforeEach(done => {
    api = new API({
      channelAccessToken: fakeChannelAccessToken
    })
    _s = sinon.sandbox.create()

    done()
  })

  afterEach(done => {
    MockRequest._reset()
    _s.restore()
    done()
  })

  it('getUserProfile', done => {
    const testUserId = 'testUserId'
    MockRequest._setRequestSuccess(true)
    MockRequest._setResponse({userId: 'test'})
    api.getUserProfile(testUserId).then(response => {
      Code.expect(MockRequest.url).to.equal(
        ENDPOINTS.PROFILE.replace('userId', testUserId))
      Code.expect(response.userId).to.equal('test')
      done()
    })
  })
})
