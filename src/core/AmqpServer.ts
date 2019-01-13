
import { Channel, connect, Connection, ConsumeMessage } from "amqplib";
import { any } from "bluebird";
import { IRpcResponse, Observable } from "../helpers/Observable";
import { RpcObservable } from "../helpers/RpcObservable";

import { v4 as uuid4 } from "uuid";
import { IContainerInjectionMetadata } from "../decorators/ContainerInject";
import { AmqpMetadataKeys, ControllerConfig, IConsumerConfig } from "../decorators/Interfaces";
import { isPromiseLike } from "../helpers/isPromiseLike";
import { AmqpMessage } from "./AmqpMessage";
import { defaultContainer } from "./Container";
import { IRpcQueueConfig } from "./Interfaces";
import {
  ConsumerHandler, IAmqpServerConfig, IContainer,
  IContainerClass, IContainerOptions, IExchangeConfig,
} from "./Interfaces";

export class AmqpServer {
  public connection: Connection;
  public channel: Channel;
  public handlersBucket: { [queue: string]: { handler: ConsumerHandler, config: IConsumerConfig } } = {};
  private container: IContainer;
  private defaultContainer: IContainer = defaultContainer;
  private containerOptions: IContainerOptions;
  private rpcQueues: IRpcQueueConfig[] = [];
  private rpcObservable = new RpcObservable<any>();
  constructor(private config: IAmqpServerConfig) { }

  public async initServer() {
    if (this.config.consumers) {
      this.config.consumers.forEach((consumer) => {
        const consumerMetadata: ControllerConfig = Reflect.getMetadata(AmqpMetadataKeys.AMQP_CONTROLLER, consumer);
        if (consumerMetadata) {
          const props = Object.getOwnPropertyNames(consumer.prototype);
          props.forEach((prop) => {
            const metaData: IConsumerConfig =
              Reflect.getMetadata(AmqpMetadataKeys.AMQP_CONSUMER, consumer.prototype[prop]);
            const hasConstructor = !!consumer.prototype.constructor;
            if (metaData) {
              metaData.json = consumerMetadata.json;
              this.handlersBucket[metaData.queue] = {
                config: metaData, handler: async (args: ConsumeMessage) => {
                  let instance;
                  if (hasConstructor) {
                    instance = this.buildController(consumer, new AmqpMessage(args));
                  } else {
                    instance = new consumer();
                  }
                  const finalArgs = this.buildArgs(instance, prop, new AmqpMessage(args));
                  const method = instance[prop](...finalArgs);
                  let finalResult;
                  if (isPromiseLike(method)) {
                    finalResult = await method;
                  } else {
                    finalResult = method;
                  }
                  if (args.properties.replyTo && args.properties.correlationId) {
                    await this.channel.sendToQueue(args.properties.replyTo, new Buffer(JSON.stringify(finalResult)),
                      { correlationId: args.properties.correlationId });
                  }
                  return finalResult;
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

  public publishMessage(queue: string, message: any, json: boolean = true) {
    const finalMessage = json ? JSON.stringify(message) : message;
    this.channel.sendToQueue(queue, new Buffer(finalMessage));
  }
  public useContainer(container: IContainer, options?: IContainerOptions) {
    this.container = container;
  }

  public async rpc<T>(queue: string, message: any, json: boolean = true, replyTo?: string) {
    return new Promise<IRpcResponse<T>>(async (resolve, reject) => {
      const finalMessage = json ? JSON.stringify(message) : message;
      const correlationId = uuid4();
      if (replyTo && this.rpcQueues.findIndex((x) => x.queue === replyTo) > -1) {
        reject(`Please register the the replyTo queue "${replyTo}" to AmqpServer config`);
      }
      replyTo = replyTo || this.getDefaultRpcQueue();
      const replyToQueue = this.rpcQueues.find((x) => x.queue === replyTo);
      if (replyToQueue) {
        this.rpcObservable.rpcSubscribe(`${replyToQueue.queue}.${replyToQueue.uniqueId}`,
          correlationId, (data) => { resolve(data); }, (error) => { reject(error); });
        await this.channel.sendToQueue(queue, new Buffer(finalMessage), {
          correlationId,
          replyTo: `${replyToQueue.queue}.${replyToQueue.uniqueId}`,
        });
      } else {
        reject(`Please register the the replyTo queue "${replyTo}" to AmqpServer config`);
      }
    });
  }

  private getDefaultRpcQueue() {
    return this.rpcQueues[0].queue;
  }
  private async assertExchanges() {
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
  private async assertQueues() {
    const queues = Object.keys(this.handlersBucket);
    queues.forEach(async (q) => {
      await this.channel.assertQueue(q);
    });
    await this.assertRpcQueues();
  }

  private async assertRpcQueues() {
    const rpcQueues = this.config.rpcQueues;
    if (rpcQueues) {
      if (rpcQueues instanceof Array) {
        if (rpcQueues.length) {
          rpcQueues.forEach((x) => {
            this.rpcQueues.push({ queue: x, uniqueId: uuid4() });
          });
        } else {
          this.rpcQueues.push({ queue: "rpc_reply", uniqueId: uuid4() });
        }
      } else {
        this.rpcQueues.push({ queue: rpcQueues, uniqueId: uuid4() });
      }
    } else {
      this.rpcQueues.push({ queue: "rpc_reply", uniqueId: uuid4() });
    }
    this.rpcQueues.forEach(async (q) => {
      await this.channel.assertQueue(`${q.queue}.${q.uniqueId}`);
    });
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

  private buildArgs(target: any, prop?: any, args?: ConsumeMessage) {
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
    this.rpcQueues.forEach((q) => {
      const key = `${q.queue}.${q.uniqueId}`;
      this.channel.consume(key, (msg: ConsumeMessage) => {
        this.rpcObservable.notifySuccess({
          channel: this.channel,
          connection: this.connection,
          message: new AmqpMessage<any>(msg),
          queue: key,
        });
      });
    });
  }

}
