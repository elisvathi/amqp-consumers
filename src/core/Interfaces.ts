import { Options } from "amqplib";
import { IExchangeConfig } from "./AmqpServer";
export interface IAmqpServerConfig {
  url: string | Options.Connect;
  consumers: any[];
  exchanges: IExchangeConfig[];
}
