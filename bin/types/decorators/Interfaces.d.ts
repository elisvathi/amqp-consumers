import "reflect-metadata";
export declare const AmqpMetadataKeys: {
    AMQP_CONSUMER: string;
    AMQP_CONTROLLER: string;
    AMQP_INJECT_CHANNEL: string;
    AMQP_INJECT_CONNECTION: string;
    AMQP_INJECT_CUSTOM: string;
    AMQP_INJECT_DATA: string;
    AMQP_INJECT_SERVER: string;
};
export declare class IControllerConfig {
    json: boolean;
}
export interface IConsumerConfig {
    queue: string;
    consumers?: number;
    consumerTag?: string;
    noLocal?: boolean;
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
    arguments?: any;
}
//# sourceMappingURL=Interfaces.d.ts.map