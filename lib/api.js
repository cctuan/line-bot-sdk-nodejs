'use strict'
// TODO: error type correction
const debug = require('debug')
const error = debug('line-bot:error')
const log = debug('line-bot:log')
const request = require('superagent-promise')(require('superagent'), Promise)

const LIMITS = require('./constants/Limit')
const ENDPOINTS = require('./constants/Endpoint')

class API {
  constructor (config) {
    this.config = config
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.config.channelAccessToken || ''
    }
  }

  getUserProfile (userId) {
    return request.get(ENDPOINTS.PROFILE.replace('userId', userId))
      .set(this.defaultHeaders)
      .end()
  }

  getMessageContent (messageId) {
    return request.get(ENDPOINTS.MESSAGE_CONTENT.replace('messageId', messageId))
      .set(this.defaultHeaders)
      .end()
  }

  sendByRefreshToken (token, messages) {
    return this.postMessage({
      messages: messages,
      replyToken: token
    }, ENDPOINTS.REPLY)
  }

  sendById (id, messages) {
    return this.postMessage({
      messages: messages,
      to: id
    }, ENDPOINTS.PUSH)
  }

  sendByUserIds (ids, messages) {
    let receivers = []
    while (ids.length) {
      receivers.push(ids.splice(0, LIMITS.MAX_USERS))
    }
    return Promise.all(receivers.map(receiver => this.postMessage({
      messages: messages,
      to: receiver
    }, ENDPOINTS.MULTICAST)
    ))
  }

  postMessage (data, url) {
    // debugging
    log('POST ' + url)
    log('headers:')
    log(this.defaultHeaders)
    log('body:')
    log(data)

    return request.post(url)
      .set(this.defaultHeaders)
      .send(data)
      .then(res => res)
      .catch(err => {
        const response = err.response
        // debugging
        error('statusCode: ' + response.statusCode)
        error('body: ')
        error(response.body)

        throw err
      })
  }

  leaveGroup (groupId) {
    return request.post(ENDPOINTS.LEAVE_GROUP.replace('groupId', groupId))
      .set(this.defaultHeaders)
      .then(res => res)
      .catch(err => {
        const response = err.response
        error('statusCode: ' + response.statusCode)
        error('body: ')
        error(response.body)
        throw err
      })
  }

  leaveRoom (roomId) {
    return request.post(ENDPOINTS.LEAVE_ROOM.replace('roomId', roomId))
      .set(this.defaultHeaders)
      .then(res => res)
      .catch(err => {
        const response = err.response

        error('statusCode: ' + response.statusCode)
        error('body: ')
        error(response.body)

        throw err
      })
  }
}

module.exports = API
