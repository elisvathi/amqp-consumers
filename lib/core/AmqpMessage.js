"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AmqpMessage {
    constructor(message) {
        this.content = message.content;
        this.fields = message.fields;
        this.properties = message.properties;
    }
    get() {
        return JSON.parse(this.content.toString());
    }
}
exports.AmqpMessage = AmqpMessage;
