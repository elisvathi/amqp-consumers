"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("./Interfaces");
function AmqpController(config) {
    return (target) => {
        Reflect.defineMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_CONTROLLER, config, target);
    };
}
exports.AmqpController = AmqpController;
//# sourceMappingURL=AmqpController.js.map