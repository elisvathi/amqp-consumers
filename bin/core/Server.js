"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const consumer_1 = require("../decorators/consumer");
const defaultContainer = new (class {
    constructor() {
        this.instances = [];
    }
    get(someClass) {
        let instance = this.instances.find(instance => instance.type === someClass);
        if (!instance) {
            instance = { type: someClass, object: new someClass() };
            this.instances.push(instance);
        }
        return instance.object;
    }
})();
class AmqpServer {
    constructor(config) {
        this.config = config;
        this.handlersBucket = {};
    }
    async initServer() {
        if (this.config.consumers) {
            this.config.consumers.forEach((consumer) => {
                const props = Object.getOwnPropertyNames(consumer.prototype);
                props.forEach(prop => {
                    const metaData = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_CONSUMES, consumer.prototype[prop]);
                    if (metaData) {
                        const conos = new consumer();
                        Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_CHANNEL, conos, prop);
                        this.handlersBucket[metaData.queue] = (args) => {
                            const instance = new consumer();
                            const dataIndexes = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_DATA, instance, prop) || [];
                            const channelIndexes = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_CHANNEL, instance, prop) || [];
                            const connectionIndexes = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_CONNECTION, instance, prop) || [];
                            const arg = {};
                            let max = 0;
                            dataIndexes.forEach((index) => {
                                arg[index] = args;
                                if (index > max) {
                                    max = index;
                                }
                            });
                            channelIndexes.forEach((index) => {
                                arg[index] = this.channel;
                                if (index > max) {
                                    max = index;
                                }
                            });
                            connectionIndexes.forEach((index) => {
                                arg[index] = this.connection;
                                if (index > max) {
                                    max = index;
                                }
                            });
                            const finalArgs = [];
                            for (let i = 0; i <= max; i++) {
                                if (arg[i]) {
                                    finalArgs[i] = arg[i];
                                }
                                else {
                                    finalArgs[i] = undefined;
                                }
                            }
                            return instance[prop](...finalArgs);
                        };
                    }
                });
            });
        }
        this.connection = await amqplib_1.connect(this.config.url);
        this.channel = await this.connection.createChannel();
        await this.assertQueues();
        Object.keys(this.handlersBucket).forEach(key => {
            this.channel.consume(key, this.handlersBucket[key]);
        });
        console.log("AMQP Server initialized");
    }
    async assertQueues() {
        const queues = Object.keys(this.handlersBucket);
        queues.forEach(async (q) => {
            await this.channel.assertQueue(q);
        });
    }
    publishMessage(queue, message) {
        this.channel.sendToQueue(queue, new Buffer(JSON.stringify(message)));
    }
}
exports.AmqpServer = AmqpServer;
//# sourceMappingURL=Server.js.map