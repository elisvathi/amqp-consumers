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
