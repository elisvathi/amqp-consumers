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
const AmqpServerConfig_1 = require("./core/AmqpServerConfig");
// tslint:disable-next-line:max-line-length
const consumer_1 = require("./decorators/consumer");
let TestConsumer = class TestConsumer {
    constructor(channel, con) {
        this.channel = channel;
    }
    testMethod(data) {
        console.log("DATA ", data.content.toString());
        this.channel.ack(data);
    }
};
__decorate([
    consumer_1.Consumer({ queue: "ELIS_VATHI", consumers: 1 }),
    __param(0, consumer_1.InjectData()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TestConsumer.prototype, "testMethod", null);
TestConsumer = __decorate([
    consumer_1.AmqpController(),
    __param(0, consumer_1.InjectChannel()), __param(1, consumer_1.InjectConnection()),
    __metadata("design:paramtypes", [Object, Object])
], TestConsumer);
exports.TestConsumer = TestConsumer;
const config = new AmqpServerConfig_1.AmqpServerConfig();
config.url = "amqp://localhost";
config.consumers = [TestConsumer];
config.exchanges = [{ name: "insta", type: "direct" }];
const server = new AmqpServer_1.AmqpServer(config);
server.initServer().then(() => {
    server.publishMessage("ELIS_VATHI", { data: "Hello world 3" });
});
//# sourceMappingURL=main.js.map