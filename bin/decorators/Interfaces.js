"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.AmqpMetadataKeys = {
    AMQP_CONSUMER: "amqpConsumer",
    AMQP_CONTROLLER: "amqpController",
    AMQP_INJECT_CHANNEL: "amqpInjectChannel",
    AMQP_INJECT_CONNECTION: "amqpInjectConnection",
    AMQP_INJECT_CUSTOM: "amqpInjectCustom",
    AMQP_INJECT_DATA: "amqpInjectData",
    AMQP_INJECT_SERVER: "amqpInjectServer",
};
class IControllerConfig {
    constructor() {
        this.json = true;
    }
}
exports.IControllerConfig = IControllerConfig;
//# sourceMappingURL=Interfaces.js.map