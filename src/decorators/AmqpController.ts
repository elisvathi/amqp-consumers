import { AmqpMetadataKeys, IControllerConfig } from "./Interfaces";
export function AmqpController<T extends {
  new(...args: any[]): {};
}>(config?: IControllerConfig) {
  return (target: T) => {
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_CONTROLLER, config, target);
  };
}
