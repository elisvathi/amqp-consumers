"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const AmqpServer_1 = require("./core/AmqpServer");
const custom_1 = require("./custom");
const AmqpController_1 = require("./decorators/AmqpController");
const Consumer_1 = require("./decorators/Consumer");
const ContainerInject_1 = require("./decorators/ContainerInject");
const InjectChannel_1 = require("./decorators/InjectChannel");
const InjectConnection_1 = require("./decorators/InjectConnection");
const InjectData_1 = require("./decorators/InjectData");
let TestConsumer = class TestConsumer {
    // tslint:disable-next-line:max-line-length
    constructor(channel, con, abc) {
        this.channel = channel;
        this.abc = abc;
    }
    testMethod(data) {
        console.log("DATA ", data.content.toString());
        this.channel.ack(data);
    }
};
__decorate([
    Consumer_1.Consumer({ queue: "TEST_QUEUE", consumers: 1 }),
    __param(0, InjectData_1.InjectData()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TestConsumer.prototype, "testMethod", null);
TestConsumer = __decorate([
    AmqpController_1.AmqpController(),
    __param(0, InjectChannel_1.InjectChannel()), __param(1, InjectConnection_1.InjectConnection()), __param(2, ContainerInject_1.ContainerInject(custom_1.CustomClass)),
    __metadata("design:paramtypes", [Object, Object, custom_1.CustomClass])
], TestConsumer);
exports.TestConsumer = TestConsumer;
const server = new AmqpServer_1.AmqpServer({
    consumers: [TestConsumer],
    exchanges: [{ name: "insta", type: "direct" }],
    url: "amqp://localhost",
});
server.initServer().then(() => {
    server.publishMessage("TEST_QUEUE", { data: "Test Message" });
});
//# sourceMappingURL=main.js.map