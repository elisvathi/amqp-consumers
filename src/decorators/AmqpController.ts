import { AmqpMetadataKeys, ControllerConfig } from "./Interfaces";
export function AmqpController<T extends {
  new(...args: any[]): {};
}>(config?: ControllerConfig) {
  config = config || new ControllerConfig();
  return (target: T) => {
    Reflect.defineMetadata(AmqpMetadataKeys.AMQP_CONTROLLER, config, target);
  };
}
