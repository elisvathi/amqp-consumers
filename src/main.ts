import { Channel, Connection } from "amqplib";
import { AmqpServer } from "./core/AmqpServer";
import { AmqpServerConfig } from "./core/AmqpServerConfig";
// tslint:disable-next-line:max-line-length
import { AmqpController, Consumer, InjectChannel, InjectConnection, InjectData, InjectServer } from "./decorators/consumer";

@AmqpController()
export class TestConsumer {
  constructor(
              @InjectChannel() private channel: Channel, @InjectConnection() con: Connection) {

  }

  @Consumer({ queue: "ELIS_VATHI", consumers: 1 })
  public testMethod(@InjectData() data: any) {
    console.log("DATA ", data.content.toString());
    this.channel.ack(data);
  }
}

const config = new AmqpServerConfig();
config.url = "amqp://localhost";
config.consumers = [TestConsumer];
config.exchanges = [{ name: "insta", type: "direct" }];
const server = new AmqpServer(config);

server.initServer().then(() => {
  server.publishMessage("ELIS_VATHI", { data: "Hello world 3" });
});
