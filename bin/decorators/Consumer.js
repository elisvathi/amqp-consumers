"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("./Interfaces");
function Consumer(config) {
    return (target, porpertyKey, descriptor) => {
        Reflect.defineMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_CONSUMER, config, target[porpertyKey]);
    };
}
exports.Consumer = Consumer;
//# sourceMappingURL=Consumer.js.map