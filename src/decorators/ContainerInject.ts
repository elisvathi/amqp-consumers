import { IContainerClass } from "../core/Interfaces";
import { AmqpMetadataKeys } from "./Interfaces";
export interface IContainerInjectionMetadata {type: IContainerClass<any> ; indices: number[]; }
export function ContainerInject<T>(clazz: IContainerClass<T>) {
  return (target: any, propertyKey: string, propertyIndex: number) => {
    const injectionParams = Reflect.getOwnMetadata(AmqpMetadataKeys.AMQP_INJECT_CUSTOM, target, propertyKey) || [];

    const index = injectionParams.findIndex((x: any) => x.type === clazz);
    if (index === -1) {
      injectionParams.push({type: clazz, indices: [propertyIndex]});
    } else {
      injectionParams[index].indices.push(propertyIndex);
    }
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_INJECT_CUSTOM,
      injectionParams, target, propertyKey);
  };
}
