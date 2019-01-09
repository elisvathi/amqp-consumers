/// <reference types="node" />
import { ConsumeMessage, ConsumeMessageFields, Message, MessageProperties } from "amqplib";
export declare class AmqpMessage<T> implements ConsumeMessage {
    content: Buffer;
    fields: ConsumeMessageFields;
    properties: MessageProperties;
    constructor(message: Message);
    get(): T;
}
//# sourceMappingURL=AmqpMessage.d.ts.map