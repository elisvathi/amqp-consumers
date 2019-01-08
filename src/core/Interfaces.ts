import { ConsumeMessage, Options } from "amqplib";

export interface IAmqpServerConfig {
  url: string | Options.Connect;
  consumers: any[];
  exchanges: IExchangeConfig[];
}
export interface IExchangeConfig {
  name: string;
  durable?: boolean;
  internal?: boolean;
  autoDelete?: boolean;
  alternateExchange?: string;
  arguments?: any;
  type: string;
}
export interface IBindingConfig {
  data?: any;
}
export interface IContainerClass<T> {
  new(...args: any[]): T;
}
export interface IContainer {
  // tslint:disable-next-line:ban-types
  get<T>(someClass: IContainerClass<T> | Function): T;
}

export interface IContainerOptions {
  fallback?: boolean;
  fallbackOnErrors?: boolean;
}

export declare type ConsumerHandler = (msg: ConsumeMessage | null) => any;
