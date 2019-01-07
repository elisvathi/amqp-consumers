"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("./Interfaces");
function InjectConnection() {
    return (target, propertyKey, propertyIndex) => {
        const injectionParams = Reflect.getOwnMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, propertyKey) || [];
        injectionParams.push(propertyIndex);
        Reflect.defineMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_CONNECTION, injectionParams, target, propertyKey);
    };
}
exports.InjectConnection = InjectConnection;
//# sourceMappingURL=InjectConnection.js.map