"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("./Interfaces");
function InjectData() {
    return (target, propertyKey, propertyIndex) => {
        const dataInjectionParams = Reflect.getOwnMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_DATA, target, propertyKey) || [];
        dataInjectionParams.push(propertyIndex);
        Reflect.defineMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_DATA, dataInjectionParams, target, propertyKey);
    };
}
exports.InjectData = InjectData;
