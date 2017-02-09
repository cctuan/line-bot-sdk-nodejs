'use strict'

const debug = require('debug')
const error = debug('line-bot:error')
const warn = debug('line-bot:warn')
const CONTENT_TYPES = require('./constants/ContentType')
const TARGET_TYPES = require('./constants/TargetType')
const LIMITS = require('./constants/Limit')

class MessageProcess {
  constructor (api, target) {
    this.targetType = null
    this.api = api
    this._messages = []
    this.target = this.identifyTarget(target)
  }

  identifyTarget (target) {
    const isValidTargetType = Object.keys(TARGET_TYPES).some((key) => {
      if (target[TARGET_TYPES[key]]) {
        this.targetType = TARGET_TYPES[key]
        return true
      }
      return false
    }, this)

    if (!isValidTargetType) {
      this.targetType = null
      return null
    }
    return target
  }

  validate () {
    // we can do more here
    return true
  }

  message (text) {
    if (!this.validate()) {
      return
    }
    if (typeof text === 'string') {
      this._messages.push({
        type: CONTENT_TYPES.TEXT,
        text: text
      })
    } else {
      warn('The message type is not correct.')
    }
    return this
  }

  location (title, lat, long, addr) {
    if (!this.validate()) {
      return
    }
    if (typeof lat === 'number' && typeof long === 'number' &&
      typeof title === 'string' && typeof addr === 'string') {
      this._messages.push({
        type: CONTENT_TYPES.LOCATION,
        title: title,
        address: addr,
        latitude: lat,
        longitude: long
      })
    } else {
      warn('The location message type is not correct.')
    }
    return this
  }

  image (originalContentUrl, previewImageUrl) {
    if (!this.validate()) {
      return
    }
    if (typeof originalContentUrl === 'string' &&
      typeof previewImageUrl === 'string') {
      this._messages.push({
        type: CONTENT_TYPES.IMAGE,
        originalContentUrl: originalContentUrl,
        previewImageUrl: previewImageUrl
      })
    } else {
      warn('The image message type is not correct')
    }
    return this
  }

  video (originalContentUrl, previewImageUrl) {
    if (!this.validate()) {
      return
    }
    if (typeof originalContentUrl === 'string' &&
      typeof previewImageUrl === 'string') {
      this._messages.push({
        type: CONTENT_TYPES.VIDEO,
        originalContentUrl: originalContentUrl,
        previewImageUrl: previewImageUrl
      })
    } else {
      warn('The video message type is not correct')
    }
    return this
  }

  audio (originalContentUrl, duration) {
    if (!this.validate()) {
      return
    }
    if (typeof originalContentUrl === 'string' && typeof duration === 'number') {
      this._messages.push({
        type: CONTENT_TYPES.AUDIO,
        originalContentUrl: originalContentUrl,
        duration: duration
      })
    }
    return this
  }

  sticker (packageId, stickerId) {
    if (!this.validate()) {
      return
    }
    if (typeof packageId === 'string' && typeof stickerId === 'string') {
      this._messages.push({
        type: CONTENT_TYPES.STICKER,
        packageId: packageId,
        stickerId: stickerId
      })
    }
    return this
  }

  imagemap (data) {
    if (!this.validate()) {
      return
    }
    if (typeof data === 'object' && data.type === CONTENT_TYPES.IMAGEMAP) {
      this._messages.push(data)
    }
    return this
  }

  template (data) {
    if (!this.validate()) {
      return
    }
    if (typeof data === 'object' && data.type === CONTENT_TYPES.TEMPLATE) {
      this._messages.push(data)
    }
    return this
  }

  // only leave group or room
  leave () {
    switch (this.targetType) {
      case TARGET_TYPES.GROUPID: {
        return this.api.leaveGroup(this.groupId)
      }
      case TARGET_TYPES.ROOMID: {
        return this.api.leaveRoom(this.roomId)
      }
      default: {
        return Promise.reject('Only leave room or group is allowed.')
      }
    }
  }

  profile () {
    switch (this.targetType) {
      case TARGET_TYPES.USERID: {
        return this.api.getUserProfile(this.target.userId).then(function (response) {
          if (response.status === 200) {
            return response.body
          } else {
            throw Error('Get user profile error.')
          }
        })
      }
      default: {
        error('Only userId has profile.')
        return Promise.reject()
      }
    }
  }

  // operations
  send () {
    let toSendMessages = []
    while (this._messages.length) {
      toSendMessages.push(this._messages.splice(0, LIMITS.MAX_MESSAGES))
    }

    let queue = []
    switch (this.targetType) {
      case TARGET_TYPES.REGRESH_TOKEN: {
        queue = toSendMessages.map(messages =>
          this.api.sendByRefreshToken(this.target.refreshToken, messages))
        break
      }
      case TARGET_TYPES.GROUPID: {
        queue = toSendMessages.map(messages =>
          this.api.sendById(this.target.groupId, messages))
        break
      }
      case TARGET_TYPES.ROOMID: {
        queue = toSendMessages.map(messages =>
          this.api.sendById(this.target.roomId, messages))
        break
      }
      case TARGET_TYPES.USERID: {
        queue = toSendMessages.map(messages =>
          this.api.sendById(this.target.userId, messages))
        break
      }
      case TARGET_TYPES.IDS: {
        queue = toSendMessages.map(messages =>
          this.api.sendByUserIds(this.target.ids, messages))
        break
      }
      default: {
        return Promise.reject('Only userId has profile.')
      }
    }
    this._messages = []
    return Promise.all(queue)
  }

  revert (steps) {
    if (!steps) {
      steps = 1
    }
    if (typeof steps !== 'number') {
      error('revert api only accept number.')
      return this
    }
    this._messages.splice(-steps, steps)
    return this
  }

  getCurrentMessages (callback) {
    callback(this._messages)
    return this
  }

  resetTarget (target) {
    this.target = this.identifyTarget(target)
    return this
  }
}

module.exports = MessageProcess
