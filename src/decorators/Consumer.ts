import { AmqpMetadataKeys, IConsumerConfig } from "./Interfaces";
export function Consumer(config?: IConsumerConfig) {
  return (target: any, porpertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_CONSUMER, config, target[porpertyKey]);
  };
}
