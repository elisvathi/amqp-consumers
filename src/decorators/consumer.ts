import "reflect-metadata";

export const AmqpMetadataKeys = {
  AMQP_CONSUMER: "amqpConsumer",
  AMQP_CONTROLLER: "amqpController",
  AMQP_INJECT_CHANNEL: "amqpInjectChannel",
  AMQP_INJECT_CONNECTION: "amqpInjectConnection",
  AMQP_INJECT_DATA: "amqpInjectData",
  AMQP_INJECT_SERVER: "amqpInjectServer",
};

export class IControllerConfig {
  public json: boolean = true;
}

export interface IConsumerConfig {
  queue: string;
  consumers?: number;
  consumerTag?: string;
  noLocal?: boolean;
  noAck?: boolean;
  exclusive?: boolean;
  priority?: number;
  arguments?: any;
}

export function AmqpController<T extends { new(...args: any[]): {} }>(config?: IControllerConfig) {
  return (target: T) => {
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_CONTROLLER, config, target);
  };
}

export function Consumer(config?: IConsumerConfig) {
  return (target: any, porpertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_CONSUMER, config, target[porpertyKey]);
  };
}

export function InjectConnection() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectionParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, propertyKey) || [];
    injectionParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, injectionParams, target, propertyKey);
  };
}

export function InjectData() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const dataInjectionParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, target, propertyKey) || [];
    dataInjectionParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, dataInjectionParams, target, propertyKey);
  };
}

export function InjectChannel() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, target, propertyKey) || [];
    injectParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, injectParams, target, propertyKey);
  };
}

export function InjectServer() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_SERVER, target, propertyKey) || [];
    injectParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_SERVER, injectParams, target, propertyKey);
  };
}
