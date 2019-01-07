import { AmqpMetadataKeys } from "./Interfaces";
export function InjectServer() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_SERVER, target, propertyKey) || [];
    injectParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_SERVER, injectParams, target, propertyKey);
  };
}
