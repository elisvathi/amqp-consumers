import { Channel, Connection } from "amqplib";
import { CustomClass } from "./custom-class";
export declare class TestConsumer {
    private channel;
    private abc;
    constructor(channel: Channel, con: Connection, abc: CustomClass);
    testMethod(data: any): void;
}
//# sourceMappingURL=intial-tests.d.ts.map