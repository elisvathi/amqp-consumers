import { Options } from "amqplib";
import { IExchangeConfig } from "./AmqpServer";
export class AmqpServerConfig {
  public url: string | Options.Connect;
  public consumers: any[] = [];
  public exchanges: IExchangeConfig[] = [];
}
