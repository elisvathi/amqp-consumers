"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.AmqpMetadataKeys = {
    AMQP_CONSUMER: "amqpConsumer",
    AMQP_CONTROLLER: "amqpController",
    AMQP_INJECT_CHANNEL: "amqpInjectChannel",
    AMQP_INJECT_CONNECTION: "amqpInjectConnection",
    AMQP_INJECT_DATA: "amqpInjectData",
    AMQP_INJECT_SERVER: "amqpInjectServer",
};
class IControllerConfig {
    constructor() {
        this.json = true;
    }
}
exports.IControllerConfig = IControllerConfig;
function AmqpController(config) {
    return (target) => {
        Reflect.defineMetadata(exports.AmqpMetadataKeys.AMQP_CONTROLLER, config, target);
    };
}
exports.AmqpController = AmqpController;
function Consumer(config) {
    return (target, porpertyKey, descriptor) => {
        Reflect.defineMetadata(exports.AmqpMetadataKeys.AMQP_CONSUMER, config, target[porpertyKey]);
    };
}
exports.Consumer = Consumer;
function InjectConnection() {
    return (target, propertyKey, propertyIndex) => {
        const injectionParams = Reflect.getOwnMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, propertyKey) || [];
        injectionParams.push(propertyIndex);
        Reflect.defineMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_CONNECTION, injectionParams, target, propertyKey);
    };
}
exports.InjectConnection = InjectConnection;
function InjectData() {
    return (target, propertyKey, propertyIndex) => {
        const dataInjectionParams = Reflect.getOwnMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_DATA, target, propertyKey) || [];
        dataInjectionParams.push(propertyIndex);
        Reflect.defineMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_DATA, dataInjectionParams, target, propertyKey);
    };
}
exports.InjectData = InjectData;
function InjectChannel() {
    return (target, propertyKey, propertyIndex) => {
        const injectParams = Reflect.getOwnMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_CHANNEL, target, propertyKey) || [];
        injectParams.push(propertyIndex);
        Reflect.defineMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_CHANNEL, injectParams, target, propertyKey);
    };
}
exports.InjectChannel = InjectChannel;
function InjectServer() {
    return (target, propertyKey, propertyIndex) => {
        const injectParams = Reflect.getOwnMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_SERVER, target, propertyKey) || [];
        injectParams.push(propertyIndex);
        Reflect.defineMetadata(exports.AmqpMetadataKeys.AMQP_INJECT_SERVER, injectParams, target, propertyKey);
    };
}
exports.InjectServer = InjectServer;
//# sourceMappingURL=consumer.js.map