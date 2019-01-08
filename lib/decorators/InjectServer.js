"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("./Interfaces");
function InjectServer() {
    return (target, propertyKey, propertyIndex) => {
        const injectParams = Reflect.getOwnMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_SERVER, target, propertyKey) || [];
        injectParams.push(propertyIndex);
        Reflect.defineMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_SERVER, injectParams, target, propertyKey);
    };
}
exports.InjectServer = InjectServer;
