import { AmqpServer } from './core/AmqpServer';
import { Consumer, Consumes, InjectData, InjectChannel } from './decorators/consumer';
import { Channel } from 'amqplib';

@Consumer()
export class TestConsumer {
  constructor() {

  }
  @Consumes({queue: "ELIS_VATHI"})
  testMethod(@InjectData() data: any, @InjectChannel() channel: Channel){
    console.log("DATA ", data.content.toString());
    channel.ack(data);
  }
}
const server = new AmqpServer({ url: 'amqp://localhost', consumers: [TestConsumer] })


server.initServer().then(()=>{
  server.publishMessage("ELIS_VATHI", {data: "Hello wolrd"})
});