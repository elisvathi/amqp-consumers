import { ConsumeMessage, ConsumeMessageFields, Message, MessageProperties } from "amqplib";
export class AmqpMessage<T> implements ConsumeMessage {
  public content: Buffer;
  public fields: ConsumeMessageFields;
  public properties: MessageProperties;
  constructor(message: Message) {
    this.content = message.content;
    this.fields = message.fields;
    this.properties = message.properties;
  }
  public get(): T {
    return JSON.parse(this.content.toString()) as T;
  }
}
