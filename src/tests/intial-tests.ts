import { Channel, Connection, Message } from "amqplib";
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
  public async testMethod(@InjectData() data: AmqpMessage<{ data: string }>) {
    console.log("DATA", data.get().data);
    this.channel.ack(data);
    return new Promise((resolve, reject) => {
      setTimeout(() => { reject({ status: "error" }); }, 4000);
    });
    // return {data: "ok"};
  }
}

const server = new AmqpServer({
  consumers: [TestConsumer],
  defaultRpcTimeout: 1000,
  exchanges: [{ name: "ex", type: "direct" }],
  // rpcQueues: [{queue: "response", timeout: 1000}],
  url: "amqp://localhost",
});

server.initServer().then(() => {
  server.rpc("TEST_QUEUE_2", { data: "Test MEssage 33" }, true).then((r) => {
    console.log("GOT RPC MESSAGE", r.get());
  }).catch((r) => {
    let message: any;
    if (r.message && r.message.get) {
      message = r.message.get();
    } else {
      message = r;
    }
    console.log("RPC ERROR", message);
  });
  // server.publishMessage("TEST_QUEUE_2", { data: "Test Message 2" });
});
