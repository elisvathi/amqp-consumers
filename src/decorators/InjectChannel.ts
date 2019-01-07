import { AmqpMetadataKeys } from "./Interfaces";
export function InjectChannel() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, target, propertyKey) || [];
    injectParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_CHANNEL, injectParams, target, propertyKey);
  };
}
