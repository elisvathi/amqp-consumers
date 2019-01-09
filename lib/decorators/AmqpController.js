"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("./Interfaces");
function AmqpController(config) {
    config = config || new Interfaces_1.ControllerConfig();
    return (target) => {
        Reflect.defineMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_CONTROLLER, config, target);
    };
}
exports.AmqpController = AmqpController;
