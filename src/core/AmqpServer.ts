
import { Channel, connect, Connection, ConsumeMessage } from "amqplib";

import { IContainerInjectionMetadata } from "../decorators/ContainerInject";
import { AmqpMetadataKeys, IConsumerConfig } from "../decorators/Interfaces";
import { defaultContainer } from "./Container";
import { ConsumerHandler, IAmqpServerConfig, IContainer,
  IContainerClass, IContainerOptions, IExchangeConfig } from "./Interfaces";

export class AmqpServer {
  public connection: Connection;
  public channel: Channel;
  public handlersBucket: { [queue: string]: { handler: ConsumerHandler, config: IConsumerConfig } } = {};
  private container: IContainer;
  private defaultContainer: IContainer = defaultContainer;
  private containerOptions: IContainerOptions;
  constructor(private config: IAmqpServerConfig) { }

  public async initServer() {
    if (this.config.consumers) {
      this.config.consumers.forEach((consumer) => {
        const consumerMetadata = Reflect.getMetadata(AmqpMetadataKeys.AMQP_CONTROLLER, consumer);
        if (consumer) {
          const props = Object.getOwnPropertyNames(consumer.prototype);
          props.forEach((prop) => {
            const metaData: IConsumerConfig =
              Reflect.getMetadata(AmqpMetadataKeys.AMQP_CONSUMER, consumer.prototype[prop]);
            const hasConstructor = !!consumer.prototype.constructor;
            if (metaData) {
              this.handlersBucket[metaData.queue] = {
                config: metaData, handler: (args: any) => {
                  let instance;
                  if (hasConstructor) {
                    instance = this.buildController(consumer, args);
                  } else {
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
    this.connection = await connect(this.config.url);
    this.channel = await this.connection.createChannel();
    await this.assertQueues();
    await this.assertExchanges();
    this.bindConsumers();
    console.log("AMQP Server initialized");
  }
  public async assertQueues() {
    const queues = Object.keys(this.handlersBucket);
    queues.forEach(async (q) => {
      await this.channel.assertQueue(q);
    });
  }
  public async assertExchanges() {
    this.config.exchanges.forEach(async (exchange: IExchangeConfig) => {
      this.channel.assertExchange(exchange.name, exchange.type, {
        alternateExchange: exchange.alternateExchange,
        arguments: exchange.arguments,
        autoDelete: exchange.autoDelete,
        durable: exchange.durable,
        internal: exchange.internal,
      });
    });
  }

  public publishMessage(queue: string, message: any) {
    this.channel.sendToQueue(queue, new Buffer(JSON.stringify(message)));
  }
  public useContainer(container: IContainer, options?: IContainerOptions) {
    this.container = container;
  }

  // tslint:disable-next-line:ban-types
  private getFromContainer<T>(someClass: IContainerClass<T> | Function) {
    if (this.container) {
      try {
        const instance = this.container.get(someClass);
        if (instance) { return instance; }
        if (!this.containerOptions || !this.containerOptions.fallback) {
          return instance;
        }
      } catch (err) {
        if (!this.containerOptions || !this.containerOptions.fallback) {
          throw (err);
        }
      }
    }
    return this.defaultContainer.get<T>(someClass);
  }

  private buildArgs(target: any, prop?: any, args?: any) {
    const dataIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, target, prop) || [];
    const channelIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, target, prop) || [];
    const connectionIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, prop) || [];
    const serverIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_SERVER, target, prop) || [];
    const customIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_CUSTOM, target, prop) || [];
    const arg: any = {};
    let max = -1;
    dataIndexes.forEach((index: number) => {
      arg[index] = args;
      if (index > max) { max = index; }
    });
    channelIndexes.forEach((index: number) => {
      arg[index] = this.channel;
      if (index > max) { max = index; }
    });
    connectionIndexes.forEach((index: number) => {
      arg[index] = this.connection;
      if (index > max) { max = index; }
    });
    serverIndexes.forEach((index: number) => {
      arg[index] = this;
      if (index > max) { max = index; }
    });
    customIndexes.forEach((data: IContainerInjectionMetadata) => {
      data.indices.forEach((ind: number) => {
        arg[ind] = this.getFromContainer(data.type);
        if (ind > max) { max = ind; }
      });
    });
    const finalArgs: any[] = [];
    if (max === -1) { return finalArgs; }
    for (let i = 0; i <= max; i++) {
      if (arg[i]) {
        finalArgs[i] = arg[i];
      } else {
        finalArgs[i] = undefined;
      }
    }
    return finalArgs;
  }
  private buildController(clazz: any, args?: any) {
    const finalArgs = this.buildArgs(clazz, undefined, args);
    return new clazz(...finalArgs);
  }
  private bindConsumers() {
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
