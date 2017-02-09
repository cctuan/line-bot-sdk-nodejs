'use strict'

const CONTENT_TYPES = require('./constants/ContentType')
const EVENT_TYPES = require('./constants/EventType')

class Parser {
  constructor (config, api) {
    this.config = config
    this.api = api
  }

  parse (json) {
    if (!json || !json.events || !json.events.length) {
      return []
    }
    return json.events.map(eventLine => this.eventParser(eventLine))
  }

  getMessageContent (messageId) {
    return this.api.getMessageContent(messageId).then(response => {
      if (response.status === 200) {
        return response.body
      }
      throw response
    })
  }

  messageParser (eventLine) {
    switch (eventLine.message.type) {
      case CONTENT_TYPES.AUDIO:
      case CONTENT_TYPES.VIDEO:
      case CONTENT_TYPES.IMAGE: {
        eventLine.message.contentGetter = () => this.getMessageContent(eventLine.message.id)
        return eventLine
      }
      default: {
        return eventLine
      }
    }
  }

  eventParser (eventLine) {
    switch (eventLine.type) {
      case EVENT_TYPES.MESSAGE: {
        return this.messageParser(eventLine)
      }
      case EVENT_TYPES.POSTBACK:
      case EVENT_TYPES.BEACON:
      case EVENT_TYPES.FOLLOW:
      case EVENT_TYPES.UNFOLLOW:
      case EVENT_TYPES.JOIN:
      case EVENT_TYPES.LEAVE: {
        return eventLine
      }
    }
  }
}

module.exports = Parser
