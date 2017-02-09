'use strict'

const crypto = require('crypto')
const debug = require('debug')
const error = debug('line-bot:error')
module.exports = function (rawJSON, channelSecret, signature) {
  if (!signature || !rawJSON || typeof rawJSON !== 'string') {
    error('Required data is not filled correctly.')
    return false
  }
  return signature === crypto.createHmac('SHA256', channelSecret).update(rawJSON).digest('base64')
}
