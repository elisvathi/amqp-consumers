import { AmqpMetadataKeys } from "./Interfaces";
export function InjectData() {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const dataInjectionParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, target, propertyKey) || [];
    dataInjectionParams.push(propertyIndex);
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_DATA, dataInjectionParams, target, propertyKey);
  };
}
