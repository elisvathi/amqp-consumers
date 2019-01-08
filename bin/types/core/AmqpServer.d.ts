import { Channel, Connection } from "amqplib";
import { IConsumerConfig } from "../decorators/Interfaces";
import { ConsumerHandler, IAmqpServerConfig, IContainer, IContainerOptions } from "./Interfaces";
export declare class AmqpServer {
    private config;
    connection: Connection;
    channel: Channel;
    handlersBucket: {
        [queue: string]: {
            handler: ConsumerHandler;
            config: IConsumerConfig;
        };
    };
    private container;
    private defaultContainer;
    private containerOptions;
    constructor(config: IAmqpServerConfig);
    initServer(): Promise<void>;
    assertQueues(): Promise<void>;
    assertExchanges(): Promise<void>;
    publishMessage(queue: string, message: any): void;
    useContainer(container: IContainer, options?: IContainerOptions): void;
    private getFromContainer;
    private buildArgs;
    private buildController;
    private bindConsumers;
}
//# sourceMappingURL=AmqpServer.d.ts.map