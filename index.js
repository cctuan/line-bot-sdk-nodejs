'use strict'

const debug = require('debug')
const error = debug('line-bot:error')
const BodyParser = require('./lib/bodyParser')
const MessageProcessor = require('./lib/messageProcessor')
const requestValidator = require('./lib/requestValidator')
const API = require('./lib/api')

const CONTENT_TYPES = require('./lib/constants/ContentType')
const EVENT_TYPES = require('./lib/constants/EventType')
const SOURCE_TYPES = require('./lib/constants/SourceType')

class LINENodeSDK {
  constructor (config) {
    this.config = config
    this.api = new API(this.config)
  }

  requestValidator (signature, body) {
    if (!this.config.channelSecret) {
      error('Please provide correct channelSecret')
      return false
    }
    return requestValidator(body, this.config.channelSecret, signature)
  }

  bodyParser (body) {
    return new BodyParser(this.config, this.api).parse(body)
  }
  /**
   * target = {refreshToken: '<refreshToken>',
              userId: '<userId>',
              roomId: '<roomId>',
              groupId: '<groupId>',
              ids: '[<userId>]'}

    sdk.to(uid).message(msg).message(msg).send();
   */
  to (target) {
    return new MessageProcessor(this.api, target)
  }
}

module.exports = {
  client: LINENodeSDK,
  CONTENT_TYPES: CONTENT_TYPES,
  EVENT_TYPES: EVENT_TYPES,
  SOURCE_TYPES: SOURCE_TYPES
}
