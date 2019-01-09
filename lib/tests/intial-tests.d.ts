import { Channel, Connection } from "amqplib";
import { AmqpMessage } from "../core/AmqpMessage";
import { CustomClass } from "./custom-class";
export declare class TestConsumer {
    private channel;
    private abc;
    constructor(channel: Channel, con: Connection, abc: CustomClass);
    testMethod(data: AmqpMessage<{
        data: string;
    }>): void;
}
//# sourceMappingURL=intial-tests.d.ts.map