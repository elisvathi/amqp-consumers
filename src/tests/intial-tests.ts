import { Channel, Connection } from "amqplib";
import { AmqpMessage } from "../core/AmqpMessage";
import { AmqpServer } from "../core/AmqpServer";
import { AmqpController } from "../decorators/AmqpController";
import { Consumer } from "../decorators/Consumer";
import { ContainerInject } from "../decorators/ContainerInject";
import { InjectChannel } from "../decorators/InjectChannel";
import { InjectConnection } from "../decorators/InjectConnection";
import { InjectData } from "../decorators/InjectData";
import { CustomClass } from "./custom-class";

@AmqpController()
export class TestConsumer {
  // tslint:disable-next-line:max-line-length
  constructor(@InjectChannel() private channel: Channel, @InjectConnection() con: Connection, @ContainerInject(CustomClass) private abc: CustomClass) {
  }

  @Consumer({ queue: "TEST_QUEUE_2", consumers: 1 })
  public testMethod(@InjectData() data: AmqpMessage<{ data: string }>) {
    console.log("DATA ", data.get().data);
    this.channel.ack(data);
  }
}

const server = new AmqpServer({
  consumers: [TestConsumer],
  exchanges: [{ name: "ex", type: "direct" }],
  url: "amqp://localhost",
});

server.initServer().then(() => {
  server.publishMessage("TEST_QUEUE_2", { data: "Test Message" });
});
