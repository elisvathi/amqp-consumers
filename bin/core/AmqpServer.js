"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const consumer_1 = require("../decorators/consumer");
class AmqpServer {
    constructor(config) {
        this.config = config;
        this.handlersBucket = {};
    }
    async initServer() {
        if (this.config.consumers) {
            this.config.consumers.forEach((consumer) => {
                const consumerMetadata = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_CONTROLLER, consumer);
                if (consumer) {
                    const props = Object.getOwnPropertyNames(consumer.prototype);
                    props.forEach((prop) => {
                        const metaData = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_CONSUMER, consumer.prototype[prop]);
                        const hasConstructor = !!consumer.prototype.constructor;
                        if (metaData) {
                            this.handlersBucket[metaData.queue] = {
                                config: metaData, handler: (args) => {
                                    let instance;
                                    if (hasConstructor) {
                                        instance = this.buildController(consumer, args);
                                    }
                                    else {
                                        instance = new consumer();
                                    }
                                    const finalArgs = this.buildArgs(instance, prop, args);
                                    return instance[prop](...finalArgs);
                                },
                            };
                        }
                    });
                }
            });
        }
        this.connection = await amqplib_1.connect(this.config.url);
        this.channel = await this.connection.createChannel();
        await this.assertQueues();
        await this.assertExchanges();
        this.bindConsumers();
        console.log("AMQP Server initialized");
    }
    async assertQueues() {
        const queues = Object.keys(this.handlersBucket);
        queues.forEach(async (q) => {
            await this.channel.assertQueue(q);
        });
    }
    async assertExchanges() {
        this.config.exchanges.forEach(async (exchange) => {
            this.channel.assertExchange(exchange.name, exchange.type, {
                alternateExchange: exchange.alternateExchange,
                arguments: exchange.arguments,
                autoDelete: exchange.autoDelete,
                durable: exchange.durable,
                internal: exchange.internal,
            });
        });
    }
    publishMessage(queue, message) {
        this.channel.sendToQueue(queue, new Buffer(JSON.stringify(message)));
    }
    buildArgs(target, prop, args) {
        const dataIndexes = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_DATA, target, prop) || [];
        const channelIndexes = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_CHANNEL, target, prop) || [];
        const connectionIndexes = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, prop) || [];
        const serverIndexes = Reflect.getMetadata(consumer_1.AmqpMetadataKeys.AMQP_INJECT_SERVER, target, prop) || [];
        const arg = {};
        let max = -1;
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
        serverIndexes.forEach((index) => {
            arg[index] = this;
            if (index > max) {
                max = index;
            }
        });
        const finalArgs = [];
        if (max === -1) {
            return finalArgs;
        }
        for (let i = 0; i <= max; i++) {
            if (arg[i]) {
                finalArgs[i] = arg[i];
            }
            else {
                finalArgs[i] = undefined;
            }
        }
        return finalArgs;
    }
    buildController(clazz, args) {
        const finalArgs = this.buildArgs(clazz, undefined, args);
        return new clazz(...finalArgs);
    }
    bindConsumers() {
        Object.keys(this.handlersBucket).forEach((key) => {
            const item = this.handlersBucket[key];
            this.channel.consume(key, item.handler, {
                arguments: item.config.arguments,
                consumerTag: item.config.consumerTag,
                noAck: item.config.noAck,
                noLocal: item.config.noAck, priority: item.config.priority,
            });
        });
    }
}
exports.AmqpServer = AmqpServer;
//# sourceMappingURL=AmqpServer.js.map