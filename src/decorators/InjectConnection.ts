import { AmqpMetadataKeys } from "./Interfaces";
export function InjectConnection() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectionParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, target, propertyKey) || [];
    injectionParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_CONNECTION, injectionParams, target, propertyKey);
  };
}
