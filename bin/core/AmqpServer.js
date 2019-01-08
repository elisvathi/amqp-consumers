"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const Interfaces_1 = require("../decorators/Interfaces");
const Container_1 = require("./Container");
class AmqpServer {
    constructor(config) {
        this.config = config;
        this.handlersBucket = {};
        this.defaultContainer = Container_1.defaultContainer;
    }
    async initServer() {
        if (this.config.consumers) {
            this.config.consumers.forEach((consumer) => {
                const consumerMetadata = Reflect.getMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_CONTROLLER, consumer);
                if (consumer) {
                    const props = Object.getOwnPropertyNames(consumer.prototype);
                    props.forEach((prop) => {
                        const metaData = Reflect.getMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_CONSUMER, consumer.prototype[prop]);
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
    useContainer(container, options) {
        this.container = container;
    }
    // tslint:disable-next-line:ban-types
    getFromContainer(someClass) {
        if (this.container) {
            try {
                const instance = this.container.get(someClass);
                if (instance) {
                    return instance;
                }
                if (!this.containerOptions || !this.containerOptions.fallback) {
                    return instance;
                }
            }
            catch (err) {
                if (!this.containerOptions || !this.containerOptions.fallback) {
                    throw (err);
                }
            }
        }
        return this.defaultContainer.get(someClass);
    }
    buildArgs(target, prop, args) {
        const dataIndexes = Reflect.getMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_DATA, target, prop) || [];
        const channelIndexes = Reflect.getMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_CHANNEL, target, prop) || [];
        const connectionIndexes = Reflect.getMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, prop) || [];
        const serverIndexes = Reflect.getMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_SERVER, target, prop) || [];
        const customIndexes = Reflect.getMetadata(Interfaces_1.AmqpMetadataKeys.AMQP_INJECT_CUSTOM, target, prop) || [];
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
        customIndexes.forEach((data) => {
            data.indices.forEach((ind) => {
                arg[ind] = this.getFromContainer(data.type);
                if (ind > max) {
                    max = ind;
                }
            });
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
