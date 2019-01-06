import 'reflect-metadata';

export const AmqpMetadataKeys = {
  AMQP_CONSUMER: 'amqpConsumer',
  AMQP_INJECT_CONNECTION: 'amqpInjectConnection',
  AMQP_INJECT_DATA: 'amqpInjectData',
  AMQP_INJECT_CHANNEL: 'amqpInjectChannel',
  AMQP_CONSUMES: 'amqpConsumes'
}

export interface IConsumerConfig {
  queue?: string;
  consumers?: number;
  autoAck?: boolean;
}

export interface IConsumesConfig {
  queue: string;
  consumers?: number;
  autoAck?: boolean;
}
export function Consumer(config?: IConsumerConfig) {
  return function (target: any) {
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_CONSUMER, config, target);
  };
}

export function Consumes(config?: IConsumesConfig) {
  return function (target: any, porpertyKey: string | symbol, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_CONSUMES, config, target[porpertyKey])
  }
}

export function InjectConnection() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectionParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, propertyKey) || [];
    injectionParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, injectionParams, target, propertyKey);
  }
}

export function InjectData() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const dataInjectionParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, target, propertyKey) || [];
    dataInjectionParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, dataInjectionParams, target, propertyKey);
  }
}

export function InjectChannel() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, target, propertyKey) || [];
    injectParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, injectParams, target, propertyKey);
  }
}