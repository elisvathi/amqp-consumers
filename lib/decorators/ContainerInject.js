"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("./Interfaces");
function ContainerInject(clazz) {
    return (target, propertyKey, propertyIndex) => {
        const injectionParams = Reflect.getOwnMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_CUSTOM, target, propertyKey) || [];
        const index = injectionParams.findIndex((x) => x.type === clazz);
        if (index === -1) {
            injectionParams.push({ type: clazz, indices: [propertyIndex] });
        }
        else {
            injectionParams[index].indices.push(propertyIndex);
        }
        Reflect.defineMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_CUSTOM, injectionParams, target, propertyKey);
    };
}
exports.ContainerInject = ContainerInject;
