import * as uuid from 'uuid'
import { connect, Connection, Options, Channel, ConsumeMessage } from 'amqplib';
import { AmqpMetadataKeys, IConsumerConfig, Consumer, IConsumesConfig } from '../decorators/consumer';

export interface IAmqpServerConfig {
  url: string | Options.Connect;
  consumers?: any[]
}

export interface IContainer {
  get<T>(arg: any): T;
}

const defaultContainer: { get<T>(someClass: { new(...args: any[]): T } | Function): T } = new (class {
  private instances: { type: Function, object: any }[] = [];
  get<T>(someClass: { new(...args: any[]): T }): T {
    let instance = this.instances.find(instance => instance.type === someClass);
    if (!instance) {
      instance = { type: someClass, object: new someClass() };
      this.instances.push(instance);
    }

    return instance.object;
  }
})();

declare type ConsumerHandler = (msg: ConsumeMessage | null) => any;
export class AmqpServer {
  constructor(private config: IAmqpServerConfig) { }
  connection: Connection
  channel: Channel;
  handlersBucket: { [queue: string]: ConsumerHandler } = {};
  async initServer() {
    if (this.config.consumers) {
      this.config.consumers.forEach((consumer) => {
        const props = Object.getOwnPropertyNames(consumer.prototype);
        props.forEach(prop => {
          const metaData: IConsumesConfig = Reflect.getMetadata(AmqpMetadataKeys.AMQP_CONSUMES, consumer.prototype[prop]);
          if (metaData) {
            const conos = new consumer();
            Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, conos, prop)
            this.handlersBucket[metaData.queue] = (args: any) => {
              const instance = new consumer();
              const dataIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, instance, prop) || [];
              const channelIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, instance, prop) || [];
              const connectionIndexes = Reflect.getMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, instance, prop) || [];
              const arg: any = {}
              let max = 0;
              dataIndexes.forEach((index: number) => {
                arg[index] = args;
                if (index > max) { max = index }
              })
              channelIndexes.forEach((index: number) => {
                arg[index] = this.channel;
                if (index > max) { max = index }
              });
              connectionIndexes.forEach((index: number) => {
                arg[index] = this.connection;
                if (index > max) { max = index }
              });
              const finalArgs = [];
              for (let i = 0; i <= max; i++) {
                if (arg[i]) {
                  finalArgs[i] = arg[i];
                } else {
                  finalArgs[i] = undefined;
                }
              }
              return instance[prop](...finalArgs);
            }
          }
        })
      })
    }
    this.connection = await connect(this.config.url);
    this.channel = await this.connection.createChannel();
    await this.assertQueues();
    Object.keys(this.handlersBucket).forEach(key => {
      this.channel.consume(key, this.handlersBucket[key])
    })
    console.log("AMQP Server initialized")
  }
  async assertQueues() {
    const queues = Object.keys(this.handlersBucket);
    queues.forEach(async (q) => {
      await this.channel.assertQueue(q);
    });
  }
  publishMessage(queue: string, message: any) {
    this.channel.sendToQueue(queue, new Buffer(JSON.stringify(message)));
  }

}